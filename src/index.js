import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentQuery = '';
let lightbox;

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const searchQuery = e.target.searchQuery.value.trim();
  if (searchQuery === '') return;

  currentQuery = searchQuery;
  page = 1;
  gallery.innerHTML = ''; // Clearing previous search results
  loadMoreBtn.style.display = 'none'; // Hide load more button on new search
  await searchImages(searchQuery, page);
});

loadMoreBtn.addEventListener('click', async () => {
  page++;
  await searchImages(currentQuery, page);
});

async function searchImages(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '12941036-2dc0de46fcc10fa4c9e72832d',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    const { data } = response;

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    data.hits.forEach(image => {
      const photoCard = document.createElement('div');
      photoCard.classList.add('photo-card');

      const imgLink = document.createElement('a');
      imgLink.href = image.largeImageURL;

      const img = document.createElement('img');
      img.src = image.webformatURL;
      img.alt = image.tags;
      img.loading = 'lazy';

      const infoDiv = document.createElement('div');
      infoDiv.classList.add('info');

      const likes = document.createElement('p');
      likes.classList.add('info-item');
      likes.innerHTML = `<b>Likes:</b> ${image.likes}`;

      const views = document.createElement('p');
      views.classList.add('info-item');
      views.innerHTML = `<b>Views:</b> ${image.views}`;

      const comments = document.createElement('p');
      comments.classList.add('info-item');
      comments.innerHTML = `<b>Comments:</b> ${image.comments}`;

      const downloads = document.createElement('p');
      downloads.classList.add('info-item');
      downloads.innerHTML = `<b>Downloads:</b> ${image.downloads}`;

      infoDiv.appendChild(likes);
      infoDiv.appendChild(views);
      infoDiv.appendChild(comments);
      infoDiv.appendChild(downloads);

      imgLink.appendChild(img);
      photoCard.appendChild(imgLink);
      photoCard.appendChild(infoDiv);
      gallery.appendChild(photoCard);
    });

    if (data.hits.length < 40 || data.totalHits <= page * 40) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreBtn.style.display = 'block';
    }

    // Initialize SimpleLightbox
    if (!lightbox) {
      lightbox = new SimpleLightbox('.gallery .photo-card a', {
        captions: true, // Show image captions
        captionsData: 'alt', // Use the 'alt' attribute for captions
      });
    } else {
      lightbox.refresh();
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure(
      'An error occurred while fetching images. Please try again later.'
    );
  }
}

// Smooth scrolling
function scrollToGallery() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
