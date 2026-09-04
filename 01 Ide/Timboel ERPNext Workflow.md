# Project Creation
Project timboel: 
- custom order
- barang development
- bisnis development

Cara buat project: 
- ctrl + g +> new project
- isi project name
- isi statue = open
- isi project type
- complete method = manual

Operasional Project:
- butuh material -> material request
	- nanti yang beli purchasing
- tasks: Vital untuk project tracking

# Warehousing
Jenis Warehouse:
- Showroom Tanli
- Gudang Molding
- Area Packing
- Gudang Selesai Produksi
- Gudang Raw Material
- Gudang Produksi

Raw Material Masuk ke Gudang
- setelah di purchase
- setelah di kembalikan karena di pinjam

Cara barang bergerak keluar masuk gudang:
- ctrl + g => Stock Entry
- Stock entry type sangat penting
	- material receipt = barang masuk ke gudang manapun, target warehouse wajib
	- material issue = barang keluar dari gudang manapun, source warehouse wajib
	- material transfer = barang pindah dari gudang A ke gudang B, target and source wajib
	- Manufacture = barang selesai masuk ke gudang selesai (untuk persiapan manufacturing module), target selalu gudang selesai
- material issue untuk project timboel => selalu tambahkan di accounting dimensions
- material issue Penerima => Wajib ada