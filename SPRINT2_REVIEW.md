# EduTask: Review Sprint 2 & Persiapan Sprint 3

Bagus sekali! Semua fondasi utama manajemen tugas (Mahasiswa) dan distribusi tugas (*Broadcast* Dosen) sudah berdiri tegak. Sebelum kita melangkah dan membangun fitur-fitur baru di **Sprint 3**, kita wajib melakukan *Quality Assurance* (QA) pada apa yang telah dibangun di Sprint 2.

Berikut adalah daftar pemeriksaan (*checklist*) menyeluruh untuk memastikan proyek Anda stabil, aman, dan bersih.

---

## 1. Security (Keamanan)

> [!CAUTION]
> Backend kita saat ini mengandalkan JWT (JSON Web Tokens). Jika tidak ditangani dengan benar, sesi pengguna bisa diretas.

*   **Validasi Kepemilikan (Authorization):** Pastikan semua rute di `apps/tasks/views.py` telah memvalidasi kepemilikan data. (Contoh: Mahasiswa A tidak boleh bisa memanipulasi *Task* milik Mahasiswa B dengan cara menebak ID). Kita sudah memasang `user=request.user` di sebagian besar *query*, namun pemeriksaan ulang (audit) tetap disarankan.
*   **Keamanan Penghapusan Massal (Cascade Delete):** Fitur Hapus Penugasan yang baru saja kita buat berhasil menghapus seluruh *Task* turunan. Kita harus menguji ulang apakah sistem ini tahan banting terhadap *race-condition* atau manipulasi data jika ditekan berulang kali oleh Dosen.
*   **Enkripsi Kata Sandi:** Verifikasi kembali bahwa semua proses registrasi di `Authentication` benar-benar sudah membungkus sandi menggunakan `make_password` bawaan Django.

## 2. Clean Code & Refactoring (Kebersihan Kode)

> [!TIP]
> Kode yang bersih mempercepat pengembangan di Sprint 3. Jika kode berantakan, *bug* akan lebih sulit dilacak.

*   **Pembersihan Komponen React:**
    *   File `DashboardPage.jsx` sempat membengkak dan memiliki duplikasi logika (seperti yang kita temukan pada tab Report). Kita perlu memastikan tidak ada lagi logika `switch` yang tumpang tindih.
    *   *Props Drilling*: Pastikan `useTasks` hook mendistribusikan fungsinya dengan rapi tanpa harus mengoper *prop* terlalu dalam ke anak komponen.
*   **Pembersihan File CSS:**
    *   Kita telah memisahkan *style* Yahya ke `yahya-dashboard.css` agar tidak bentrok dengan TailwindCSS. Di Sprint 3, ada baiknya melakukan audit CSS untuk membuang gaya usang (*dead CSS*) yang tidak lagi terpakai.

## 3. Testing (Pengujian Fungsional)

> [!IMPORTANT]
> Jangan masuk ke Sprint 3 sebelum 3 skenario inti ini lulus 100% tanpa *error* di konsol.

1.  **Skenario Dosen (Distribusi):** Dosen *login* -> Dosen membuat tugas baru dan menugaskannya ke Kelas 1 dan Kelas 2 -> Dosen membuka tab *Report* dan melihat tugas tersebut tercatat dengan status "To Do".
2.  **Skenario Mahasiswa (Pengerjaan):** Mahasiswa *login* -> Mahasiswa menerima tugas dari Dosen di papan Kanban -> Mahasiswa menggesernya ke "In Progress" -> Data tersimpan di server (*refresh* halaman tidak mengubah posisi).
3.  **Skenario Reaksi Berantai:** Mahasiswa menyelesaikan tugas -> Dosen melihat *Report* dan angkanya bertambah di kolom "Selesai" -> Dosen menekan "Hapus Penugasan" -> Papan Kanban Mahasiswa seketika kosong dari tugas tersebut.

## 4. Persiapan Lanjut (Sprint 3)

> [!NOTE]
> Setelah Sprint 2 dipastikan bebas hambatan, berikut adalah menu utama untuk **Sprint 3** sesuai arsitektur awal Anda.

*   **Sistem Notifikasi Lanjutan:** Mengganti data "Palsu" (Mockup) pada bel notifikasi (atas kanan dasbor) menjadi notifikasi waktu-nyata (*real-time*) dari *database*, agar Mahasiswa langsung tahu saat Dosen menyebar tugas baru.
*   **Sistem Lampiran Berkas (File Upload):** Memberikan akses bagi Mahasiswa untuk mengunggah dokumen/PDF (pengumpulan tugas) ke dalam *detail task* mereka.
*   **Sistem Kolaborasi Pesan (Inbox):** Mengaktifkan modul *chat* atau komentar (*Inbox*) agar Mahasiswa dapat berdiskusi atau bertanya kepada Dosen mengenai suatu Penugasan.
*   **Kalender Interaktif:** Menautkan tanggal `deadline` dari setiap *Task* ke dalam tampilan kalender *frontend*.
