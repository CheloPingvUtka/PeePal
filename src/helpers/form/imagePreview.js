export const selectedImages = [];
export const selectedReviewImages = [];

export function setupImagePreview({ inputId, previewContainerId, imageArray }) {
  const input = document.getElementById(inputId);
  const previewContainer = document.getElementById(previewContainerId);

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      imageArray.push(file);
      const reader = new FileReader();

      reader.onload = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-image-wrapper';

        const img = document.createElement('img');
        img.src = reader.result;
        img.className = 'preview-image';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerText = '×';

        removeBtn.onclick = () => {
          imageArray.splice(imageArray.indexOf(file), 1);
          wrapper.remove();
        };

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        previewContainer.appendChild(wrapper);
      };

      reader.readAsDataURL(file);
    }

    e.target.value = '';
  });
}

export function resetPreview() {
  selectedImages.length = 0;
  document.getElementById('photo-preview').innerHTML = '';
  document.getElementById('photo-input').value = '';
}
