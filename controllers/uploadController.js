export const uploadProductImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diupload" });
  }

  // Path yang akan disimpan ke database
  const imagePath = `uploads/products/${req.file.filename}`;

  return res.json({
    success: true,
    message: "Upload berhasil",
    image_path: imagePath,
  });
};
