document.getElementById('saveBtn').addEventListener('click', () => {
  const url = document.getElementById('webUrl').value;
  chrome.storage.local.set({ targetUrl: url }, () => {
    alert('URL berhasil disimpan! Silakan refresh halaman target.');
  });
});

// Load URL yang sudah tersimpan sebelumnya
chrome.storage.local.get(['targetUrl'], (result) => {
  if (result.targetUrl) {
    document.getElementById('webUrl').value = result.targetUrl;
  }
});