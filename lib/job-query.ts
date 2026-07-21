import type { SupabaseClient } from '@supabase/supabase-js'
import { getExpiryCutoffISOString } from './job-utils'
import type { Job, JobType, WorkArrangement } from './types'

export const JOB_TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Freelance']
export const WORK_ARRANGEMENTS: WorkArrangement[] = ['Full Remote', 'Hybrid']
export type SortOption = 'terbaru' | 'gaji'

export const DEFAULT_PAGE_SIZE = 10
// Batas atas "jumlah" biar orang nggak bisa nembak ?jumlah=999999 dan
// maksa server narik semua baris sekaligus — balik lagi ke masalah awal
// yang lagi kita benerin.
const MAX_PAGE_SIZE = 200

export interface JobFilters {
  q: string
  kategori: string | null
  tipe: JobType | null
  susunan: WorkArrangement | null
  gaji: number
  urutan: SortOption
  jumlah: number
}

export type RawSearchParams = Record<string, string | string[] | undefined>

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

// Cuma izinkan huruf (termasuk huruf ber-diakritik/non-Latin), angka,
// spasi, dan strip di kata kunci pencarian — buang selain itu (termasuk
// koma, titik, kurung, %, _). Ini BUKAN soal SQL injection (Supabase/
// PostgREST sudah aman dari itu secara bawaan), tapi karena string
// pencarian ini nanti ikut disisipkan ke sintaks filter `.or()` di bawah
// — karakter seperti koma/kurung punya arti khusus di situ, jadi lebih
// aman disaring dulu sebelum dipakai daripada di-escape satu-satu.
function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .slice(0, 100)
}

// Baca query string (?tipe=Full-time&gaji=10000000, dst) jadi objek
// filter yang sudah divalidasi, dengan nilai default kalau kosong/nggak
// valid. `forcedKategori` dipakai dari app/kategori/[slug]/page.tsx —
// slug dari URL path selalu menang dibanding query string ?kategori=,
// supaya halaman /kategori/teknologi nggak bisa "dibajak" filter-nya
// lewat query string yang beda.
export function parseJobFilters(
  searchParams: RawSearchParams,
  forcedKategori?: string | null
): JobFilters {
  const q = sanitizeSearchTerm(firstValue(searchParams.q) ?? '')

  const rawKategori = forcedKategori ?? firstValue(searchParams.kategori) ?? null
  const kategori = rawKategori && rawKategori.trim() !== '' ? rawKategori.trim() : null

  const rawTipe = firstValue(searchParams.tipe)
  const tipe = (JOB_TYPES as string[]).includes(rawTipe ?? '') ? (rawTipe as JobType) : null

  const rawSusunan = firstValue(searchParams.susunan)
  const susunan = (WORK_ARRANGEMENTS as string[]).includes(rawSusunan ?? '')
    ? (rawSusunan as WorkArrangement)
    : null

  const rawGaji = Number(firstValue(searchParams.gaji))
  const gaji = Number.isFinite(rawGaji) && rawGaji > 0 ? Math.floor(rawGaji) : 0

  const rawUrutan = firstValue(searchParams.urutan)
  const urutan: SortOption = rawUrutan === 'gaji' ? 'gaji' : 'terbaru'

  const rawJumlah = Number(firstValue(searchParams.jumlah))
  const jumlah =
    Number.isFinite(rawJumlah) && rawJumlah > 0
      ? Math.min(Math.floor(rawJumlah), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE

  return { q, kategori, tipe, susunan, gaji, urutan, jumlah }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JobsQueryBuilder = any

// Dipakai bareng oleh fetchFilteredJobs & fetchFilteredJobsCount, biar
// aturan filter-nya nggak ditulis dobel di 2 tempat.
function applyFilters(query: JobsQueryBuilder, filters: JobFilters): JobsQueryBuilder {
  let q = query.eq('is_approved', true).gte('created_at', getExpiryCutoffISOString())

  if (filters.kategori) {
    q = q.eq('categories.slug', filters.kategori)
  }
  if (filters.tipe) {
    q = q.eq('job_type', filters.tipe)
  }
  if (filters.susunan) {
    q = q.eq('work_arrangement', filters.susunan)
  }
  if (filters.q) {
    q = q.or(`title.ilike.%${filters.q}%,company_name.ilike.%${filters.q}%`)
  }
  if (filters.gaji > 0) {
    // Samakan logikanya dengan versi lama yang dulu jalan di client:
    // loker "lolos" filter gaji minimum kalau salary_max terisi & >=
    // gaji, ATAU salary_max kosong tapi salary_min >= gaji. Loker yang
    // dua-duanya kosong otomatis nggak lolos filter gaji.
    q = q.or(`salary_max.gte.${filters.gaji},and(salary_max.is.null,salary_min.gte.${filters.gaji})`)
  }

  return q
}

interface FetchJobsResult {
  jobs: Job[]
  hasMore: boolean
}

// Query utama: ambil loker sesuai filter LANGSUNG dari database, sudah
// diurutkan & dibatasi jumlahnya di server — bukan lagi ambil semua terus
// disaring di browser. Dipakai bareng oleh homepage & /kategori/[slug].
export async function fetchFilteredJobs(
  supabase: SupabaseClient,
  filters: JobFilters
): Promise<FetchJobsResult> {
  const select = filters.kategori ? '*, categories!inner(*)' : '*, categories(*)'
  let query = applyFilters(supabase.from('jobs').select(select), filters)

  if (filters.urutan === 'gaji') {
    // PostgREST nggak bisa order berdasarkan COALESCE(salary_max,
    // salary_min) dalam satu kolom komputasi lewat query builder biasa,
    // jadi didekati dengan order 2 kolom berurutan — hasilnya sangat
    // dekat dengan versi lama, walau nggak 100% identik untuk kasus
    // campuran salary_max/salary_min yang jarang terjadi.
    query = query
      .order('salary_max', { ascending: false, nullsFirst: false })
      .order('salary_min', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  // Ambil 1 baris ekstra dari yang diminta, buat tahu apa "Muat Lebih
  // Banyak" masih perlu ditampilkan — tanpa butuh query COUNT terpisah.
  const { data, error } = await query.range(0, filters.jumlah)

  if (error) {
    console.error('Gagal mengambil data jobs:', error.message)
    return { jobs: [], hasMore: false }
  }

  const rows = (data as Job[]) ?? []
  return { jobs: rows.slice(0, filters.jumlah), hasMore: rows.length > filters.jumlah }
}

// Total loker yang cocok filter saat ini (dipakai buat teks "X loker" di
// FilterBar) — query count doang (head: true), nggak ikut narik data
// baris, jadi tetap ringan.
export async function fetchFilteredJobsCount(
  supabase: SupabaseClient,
  filters: JobFilters
): Promise<number> {
  const select = filters.kategori ? '*, categories!inner(*)' : '*'
  const query = applyFilters(
    supabase.from('jobs').select(select, { count: 'exact', head: true }),
    filters
  )
  const { count, error } = await query

  if (error) {
    console.error('Gagal menghitung hasil filter jobs:', error.message)
    return 0
  }
  return count ?? 0
}

// Loker yang tampil di kartu "melayang" pada Hero — SENGAJA selalu loker
// unggulan ter-atas se-situs, TIDAK terpengaruh filter yang lagi aktif
// (persis perilaku lama: dulu ini selalu initialJobs[0] dari fetch tanpa
// filter, supaya kartu ini nggak lompat-lompat tiap user ganti filter).
export async function fetchTopJob(supabase: SupabaseClient): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, categories(*)')
    .eq('is_approved', true)
    .gte('created_at', getExpiryCutoffISOString())
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Gagal mengambil top job:', error.message)
    return null
  }
  return data as Job | null
}

// Dipakai buat badge "X loker remote aktif" & statistik sidebar — TOTAL
// loker aktif TANPA filter apa pun, supaya angkanya stabil, nggak
// berubah-ubah tiap user ganti filter.
export async function fetchTotalActiveJobsCount(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)
    .gte('created_at', getExpiryCutoffISOString())

  if (error) {
    console.error('Gagal menghitung total jobs:', error.message)
    return 0
  }
  return count ?? 0
}

// Jumlah perusahaan unik — cuma ambil kolom company_name (bukan seluruh
// baris loker beserta relasinya) biar tetap ringan sekalipun jumlah
// loker aktif nanti sudah ratusan.
export async function fetchTotalCompaniesCount(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('jobs')
    .select('company_name')
    .eq('is_approved', true)
    .gte('created_at', getExpiryCutoffISOString())

  if (error) {
    console.error('Gagal menghitung total companies:', error.message)
    return 0
  }
  return new Set((data ?? []).map((row: { company_name: string }) => row.company_name)).size
}

// Bikin href buat tombol "Muat Lebih Banyak" — pathname yang sama, semua
// filter aktif dipertahankan, cuma "jumlah" yang ditambah.
export function buildLoadMoreHref(
  pathname: string,
  searchParams: RawSearchParams,
  currentJumlah: number
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'jumlah') continue
    const v = firstValue(value)
    if (v) params.set(key, v)
  }
  params.set('jumlah', String(currentJumlah + DEFAULT_PAGE_SIZE))
  return `${pathname}?${params.toString()}`
}