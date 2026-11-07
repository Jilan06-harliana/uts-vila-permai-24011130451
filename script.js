// Data unit vila disimpan di JavaScript karena aplikasi ini tidak memakai back-end.
const dataVila = [
  {
    id: "vila-1",
    nama: "Vila Pinus",
    tipe: "2 kamar tidur",
    lokasi: "Puncak, Kabupaten Bogor",
    harga: 650000,
    fasilitas: ["Wi-Fi", "Dapur", "Parkir", "Area keluarga"],
    tersedia: true,
    kapasitas: 4
  },
  {
    id: "vila-2",
    nama: "Vila Melati",
    tipe: "3 kamar tidur",
    lokasi: "Puncak, Kabupaten Bogor",
    harga: 850000,
    fasilitas: ["Wi-Fi", "Kolam kecil", "Dapur", "Parkir"],
    tersedia: true,
    kapasitas: 6
  },
  {
    id: "vila-3",
    nama: "Vila Cemara",
    tipe: "4 kamar tidur",
    lokasi: "Puncak, Kabupaten Bogor",
    harga: 1100000,
    fasilitas: ["Wi-Fi", "Balkon", "Dapur", "Area BBQ"],
    tersedia: true,
    kapasitas: 10
  }
];

const kunciPesanan = "vilaPermai_pesanan";
const kunciNamaTerakhir = "vilaPermai_namaTerakhir";

const elemen = {
  daftarVila: document.getElementById("daftar-kartu-vila"),
  pencarian: document.getElementById("cari-vila"),
  form: document.getElementById("form-pemesanan"),
  nama: document.getElementById("nama-tamu"),
  checkIn: document.getElementById("check-in"),
  checkOut: document.getElementById("check-out"),
  jumlahTamu: document.getElementById("jumlah-tamu"),
  pilihanVila: document.getElementById("pilihan-vila"),
  ringkasan: document.getElementById("ringkasan-biaya"),
  pesan: document.getElementById("pesan-form"),
  daftarPesanan: document.getElementById("daftar-pesanan"),
  tombolCek: document.getElementById("tombol-cek")
};

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
}

function tanggalLokal(tanggal) {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

function buatTanggalDariInput(nilai) {
  if (!nilai) return null;
  const [tahun, bulan, hari] = nilai.split("-").map(Number);
  return new Date(tahun, bulan - 1, hari);
}

function hitungJumlahMalam(checkIn, checkOut) {
  const selisih = checkOut - checkIn;
  return Math.round(selisih / (1000 * 60 * 60 * 24));
}

function ambilPesanan() {
  try {
    const data = localStorage.getItem(kunciPesanan);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Pesanan lokal tidak dapat dibaca:", error);
    tampilkanPesan("Data pesanan di browser tidak dapat dibaca. Coba muat ulang halaman.", "error");
    return [];
  }
}

function simpanPesanan(pesanan) {
  try {
    localStorage.setItem(kunciPesanan, JSON.stringify(pesanan));
    return true;
  } catch (error) {
    console.error("Pesanan tidak dapat disimpan:", error);
    tampilkanPesan("Pesanan tidak dapat disimpan di perangkat ini. Periksa ruang penyimpanan browser.", "error");
    return false;
  }
}

function renderDaftarVila(kataKunci = "") {
  elemen.daftarVila.replaceChildren();
  const kata = kataKunci.trim().toLowerCase();
  const hasilFilter = dataVila.filter((vila) => {
    const gabungan = [vila.nama, vila.tipe, vila.lokasi, ...vila.fasilitas].join(" ").toLowerCase();
    return gabungan.includes(kata);
  });

  if (hasilFilter.length === 0) {
    const kosong = document.createElement("p");
    kosong.className = "notice";
    kosong.textContent = "Vila tidak ditemukan. Coba kata kunci lain.";
    elemen.daftarVila.appendChild(kosong);
    return;
  }

  hasilFilter.forEach((vila) => {
    const kartu = document.createElement("article");
    kartu.className = "villa-card";

    const bagianAtas = document.createElement("div");
    bagianAtas.className = "villa-card__top";

    const identitas = document.createElement("div");
    const judul = document.createElement("h3");
    judul.textContent = vila.nama;
    const tipe = document.createElement("p");
    tipe.className = "villa-card__type";
    tipe.textContent = vila.tipe;
    identitas.append(judul, tipe);

    const status = document.createElement("span");
    status.className = vila.tersedia ? "status" : "status status--unavailable";
    status.textContent = vila.tersedia ? "Tersedia" : "Tidak tersedia";
    bagianAtas.append(identitas, status);

    const lokasi = document.createElement("p");
    lokasi.className = "villa-card__location";
    lokasi.textContent = `⌖ ${vila.lokasi}`;

    const harga = document.createElement("p");
    harga.className = "villa-card__price";
    harga.textContent = formatRupiah(vila.harga);
    const satuan = document.createElement("span");
    satuan.textContent = " / malam";
    harga.appendChild(satuan);

    const fasilitas = document.createElement("ul");
    fasilitas.className = "villa-card__facilities";
    vila.fasilitas.forEach((namaFasilitas) => {
      const item = document.createElement("li");
      item.textContent = namaFasilitas;
      fasilitas.appendChild(item);
    });

    const kapasitas = document.createElement("p");
    kapasitas.className = "villa-card__location";
    kapasitas.textContent = `Kapasitas maksimal ${vila.kapasitas} tamu`;

    kartu.append(bagianAtas, lokasi, harga, fasilitas, kapasitas);
    elemen.daftarVila.appendChild(kartu);
  });
}

function isiPilihanVila() {
  dataVila.forEach((vila) => {
    const opsi = document.createElement("option");
    opsi.value = vila.id;
    opsi.textContent = `${vila.nama} — ${formatRupiah(vila.harga)}/malam`;
    elemen.pilihanVila.appendChild(opsi);
  });
}

function hitungTotalHarga() {
  const vila = dataVila.find((item) => item.id === elemen.pilihanVila.value);
  const checkIn = buatTanggalDariInput(elemen.checkIn.value);
  const checkOut = buatTanggalDariInput(elemen.checkOut.value);

  if (!vila || !checkIn || !checkOut || checkOut <= checkIn) {
    elemen.ringkasan.replaceChildren();
    const judul = document.createElement("h3");
    judul.textContent = "Perkiraan biaya";
    const petunjuk = document.createElement("p");
    petunjuk.className = "price-preview__hint";
    petunjuk.textContent = "Pilih vila dan tanggal check-out setelah check-in untuk melihat total biaya.";
    elemen.ringkasan.append(judul, petunjuk);
    return null;
  }

  const malam = hitungJumlahMalam(checkIn, checkOut);
  const total = vila.harga * malam;
  elemen.ringkasan.replaceChildren();

  const judul = document.createElement("h3");
  judul.textContent = "Perkiraan biaya";
  const barisHarga = buatBarisHarga("Harga per malam", formatRupiah(vila.harga));
  const barisMalam = buatBarisHarga("Lama menginap", `${malam} malam`);
  const barisTamu = buatBarisHarga("Jumlah tamu", `${elemen.jumlahTamu.value || 0} orang`);
  const barisTotal = buatBarisHarga("Total biaya", formatRupiah(total), true);

  elemen.ringkasan.append(judul, barisHarga, barisMalam, barisTamu, barisTotal);
  return { vila, malam, total };
}

function buatBarisHarga(label, nilai, total = false) {
  const baris = document.createElement("p");
  baris.className = total ? "price-line price-line--total" : "price-line";
  const teksLabel = document.createElement("span");
  teksLabel.textContent = label;
  const teksNilai = document.createElement("strong");
  teksNilai.textContent = nilai;
  baris.append(teksLabel, teksNilai);
  return baris;
}

function validasiForm() {
  const nama = elemen.nama.value.trim();
  const checkIn = buatTanggalDariInput(elemen.checkIn.value);
  const checkOut = buatTanggalDariInput(elemen.checkOut.value);
  const jumlah = Number(elemen.jumlahTamu.value);
  const vila = dataVila.find((item) => item.id === elemen.pilihanVila.value);
  const hariIni = buatTanggalDariInput(tanggalLokal(new Date()));
  let valid = true;

  document.querySelectorAll(".field-error").forEach((item) => {
    item.textContent = "";
  });

  if (!nama) {
    document.getElementById("error-nama").textContent = "Nama tamu wajib diisi.";
    valid = false;
  }
  if (!checkIn) {
    document.getElementById("error-checkin").textContent = "Tanggal check-in wajib dipilih.";
    valid = false;
  } else if (checkIn < hariIni) {
    document.getElementById("error-checkin").textContent = "Tanggal check-in tidak boleh di masa lalu.";
    valid = false;
  }
  if (!checkOut) {
    document.getElementById("error-checkout").textContent = "Tanggal check-out wajib dipilih.";
    valid = false;
  } else if (checkIn && checkOut <= checkIn) {
    document.getElementById("error-checkout").textContent = "Tanggal check-out harus setelah check-in.";
    valid = false;
  }
  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 10) {
    document.getElementById("error-tamu").textContent = "Jumlah tamu harus antara 1 sampai 10 orang.";
    valid = false;
  }
  if (!vila) {
    document.getElementById("error-vila").textContent = "Silakan pilih unit vila.";
    valid = false;
  } else if (Number.isInteger(jumlah) && jumlah > vila.kapasitas) {
    document.getElementById("error-tamu").textContent = `Kapasitas ${vila.nama} maksimal ${vila.kapasitas} tamu.`;
    valid = false;
  }

  return valid;
}

function cekBentrok(vilaId, checkIn, checkOut) {
  const pesanan = ambilPesanan();
  return pesanan.some((item) => {
    if (item.vilaId !== vilaId) return false;
    const masukLama = buatTanggalDariInput(item.checkIn);
    const keluarLama = buatTanggalDariInput(item.checkOut);
    return checkIn < keluarLama && checkOut > masukLama;
  });
}

function tampilkanPesan(teks, jenis) {
  elemen.pesan.textContent = teks;
  elemen.pesan.className = `form-message ${jenis === "error" ? "form-message--error" : "form-message--success"}`;
}

function tampilkanPesanan() {
  const pesanan = ambilPesanan();
  elemen.daftarPesanan.replaceChildren();

  if (pesanan.length === 0) {
    const kosong = document.createElement("p");
    kosong.className = "notice";
    kosong.textContent = "Belum ada pesanan tersimpan di perangkat ini.";
    elemen.daftarPesanan.appendChild(kosong);
    return;
  }

  pesanan.slice().reverse().forEach((item) => {
    const kartu = document.createElement("article");
    kartu.className = "order-item";
    const judul = document.createElement("h3");
    judul.textContent = `${item.nama} — ${item.vilaNama}`;
    const tanggal = document.createElement("p");
    tanggal.textContent = `${item.checkIn} sampai ${item.checkOut} (${item.malam} malam)`;
    const detail = document.createElement("p");
    detail.textContent = `${item.jumlahTamu} tamu · Total ${formatRupiah(item.total)}`;
    kartu.append(judul, tanggal, detail);
    elemen.daftarPesanan.appendChild(kartu);
  });
}

function cekKetersediaan() {
  if (!validasiForm()) {
    tampilkanPesan("Periksa kembali data yang ditandai sebelum melanjutkan.", "error");
    return;
  }

  const hasil = hitungTotalHarga();
  const checkIn = buatTanggalDariInput(elemen.checkIn.value);
  const checkOut = buatTanggalDariInput(elemen.checkOut.value);

  if (cekBentrok(hasil.vila.id, checkIn, checkOut)) {
    tampilkanPesan("Maaf, unit vila sudah memiliki pesanan pada tanggal tersebut. Silakan pilih tanggal lain.", "error");
    return;
  }

  tampilkanPesan(`Unit ${hasil.vila.nama} tersedia untuk ${hasil.malam} malam. Silakan tekan Pesan Sekarang jika ingin menyimpan pesanan.`, "success");
}

elemen.pencarian.addEventListener("input", (event) => {
  renderDaftarVila(event.target.value);
});

[elemen.pilihanVila, elemen.checkIn, elemen.checkOut, elemen.jumlahTamu].forEach((input) => {
  input.addEventListener("input", hitungTotalHarga);
  input.addEventListener("change", hitungTotalHarga);
});

elemen.tombolCek.addEventListener("click", cekKetersediaan);

elemen.form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validasiForm()) {
    tampilkanPesan("Pesanan belum dapat diproses. Silakan perbaiki data yang salah.", "error");
    return;
  }

  const hasil = hitungTotalHarga();
  const checkIn = buatTanggalDariInput(elemen.checkIn.value);
  const checkOut = buatTanggalDariInput(elemen.checkOut.value);

  if (cekBentrok(hasil.vila.id, checkIn, checkOut)) {
    tampilkanPesan("Maaf, tanggal tersebut baru saja terisi pada perangkat ini. Silakan pilih tanggal lain.", "error");
    return;
  }

  const pesanan = ambilPesanan();
  const pesananBaru = {
    id: Date.now(),
    nama: elemen.nama.value.trim(),
    vilaId: hasil.vila.id,
    vilaNama: hasil.vila.nama,
    checkIn: elemen.checkIn.value,
    checkOut: elemen.checkOut.value,
    jumlahTamu: Number(elemen.jumlahTamu.value),
    malam: hasil.malam,
    total: hasil.total
  };

  pesanan.push(pesananBaru);
  if (!simpanPesanan(pesanan)) return;

  try {
    localStorage.setItem(kunciNamaTerakhir, pesananBaru.nama);
  } catch (error) {
    console.warn("Nama terakhir tidak dapat disimpan:", error);
  }

  tampilkanPesanan();
  tampilkanPesan("Pesanan berhasil disimpan di browser ini. Hubungi Pak Hendra untuk konfirmasi akhir.", "success");
  elemen.form.reset();
  elemen.jumlahTamu.value = "2";
  hitungTotalHarga();
});

function aturTanggalMinimum() {
  const hariIni = tanggalLokal(new Date());
  elemen.checkIn.min = hariIni;
  elemen.checkOut.min = hariIni;
}

function mulaiAplikasi() {
  aturTanggalMinimum();
  renderDaftarVila();
  isiPilihanVila();
  tampilkanPesanan();
  document.getElementById("tahun-sekarang").textContent = new Date().getFullYear();

  try {
    const namaTerakhir = localStorage.getItem(kunciNamaTerakhir);
    if (namaTerakhir) elemen.nama.value = namaTerakhir;
  } catch (error) {
    console.warn("Nama terakhir tidak dapat dimuat:", error);
  }
}

mulaiAplikasi();
