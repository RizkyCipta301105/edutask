import os
from django.db.models.signals import m2m_changed, pre_save, post_delete
from django.dispatch import receiver
from apps.tasks.models import PenugasanDosen, Task, MataKuliah, Notification
from apps.authentication.models import User

@receiver(m2m_changed, sender=PenugasanDosen.ruang_tujuan.through)
def broadcast_penugasan_ke_mahasiswa(sender, instance, action, pk_set, **kwargs):
    """
    Sistem Broadcast Otomatis:
    Saat dosen memilih beberapa 'Ruang' untuk sebuah PenugasanDosen,
    sistem akan mencari semua Mahasiswa di ruang tersebut dan membuatkan
    Task individual untuk mereka di Kanban board masing-masing.
    """
    if action == "post_add":
        from apps.authentication.models import RuangEdukasi
        ruang_list = RuangEdukasi.objects.filter(pk__in=pk_set)
        for ruang in ruang_list:
            # Ambil semua mahasiswa aktif yang berada di ruang yang dituju
            mahasiswa_list = ruang.anggota.filter(is_active=True)
            
            for mhs in mahasiswa_list:
                # Hindari duplikasi jika tugas sudah pernah didistribusikan
                if not Task.objects.filter(user=mhs, source_assignment=instance).exists():
                    
                    # Pastikan mahasiswa ini memiliki Kategori Mata Kuliah yang sesuai
                    mk_obj, created = MataKuliah.objects.get_or_create(
                        user=mhs,
                        nama__iexact=instance.mata_kuliah, # Cek case-insensitive
                        defaults={
                            'nama': instance.mata_kuliah,
                            'nama_dosen': instance.dosen.nama_lengkap,
                            'warna': '#3b82f6' # Biru cerah default untuk tugas dosen
                        }
                    )
                    
                    # Taruh tugas ini di kolom paling bawah pada status "To Do"
                    next_urutan = Task.objects.get_next_urutan(mhs, Task.Status.TODO)
                    
                    # Sebarkan tugas (Clone)
                    Task.objects.create(
                        user=mhs,
                        mata_kuliah=mk_obj,
                        source_assignment=instance,
                        judul=instance.judul,
                        deskripsi=instance.deskripsi,
                        deadline=instance.deadline,
                        prioritas=instance.prioritas,
                        status=Task.Status.TODO,
                        urutan=next_urutan
                    )
                    
                    # Buat Notifikasi
                    Notification.objects.create(
                        user=mhs,
                        task=Task.objects.filter(user=mhs, source_assignment=instance).first(),
                        title="Tugas Baru dari Dosen",
                        message=f'Tugas baru: "{instance.judul}" dari {instance.dosen.nama_lengkap}.'
                    )

@receiver(post_delete, sender=Task)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Menghapus file dari sistem file saat Task dihapus.
    """
    if instance.attachment:
        if os.path.isfile(instance.attachment.path):
            os.remove(instance.attachment.path)

@receiver(pre_save, sender=Task)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Menghapus file lama dari sistem file saat objek Task diperbarui dengan file baru.
    """
    if not instance.pk:
        return

    try:
        old_file = Task.objects.get(pk=instance.pk).attachment
    except Task.DoesNotExist:
        return

    new_file = instance.attachment
    if not old_file == new_file and old_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)
