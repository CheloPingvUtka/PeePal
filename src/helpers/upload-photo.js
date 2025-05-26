const file = document.getElementById('photo-input').files[0];
const formData = new FormData();
formData.append('image', file);
formData.append('location', 1);  // или реальный ID
formData.append('review', null);  // или null

fetch('/api/upload-photo/', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log('Image URL:', data.photo_url);
});
