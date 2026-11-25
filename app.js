/**
 * Pulse Social App — Main Interactivity & UI Handler
 * Integrates navigation, social interactions, animations and Firebase events.
 */

import { app, analytics, firebaseConfig } from 'firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initToast();
  initLikeButtons();
  initDoubleTapLike();
  initBookmarkButtons();
  initFollowButtons();
  initCreatePostModal();
  initStories();
  initDirectMessagesSearch();
  initExploreSearch();
});

/* ==========================================================================
   10. Page Transitions — Smooth fade between screens
   ========================================================================== */
function initPageTransitions() {
  // Fade in current page on load
  document.body.classList.add('pulse-page-enter');
  setTimeout(() => document.body.classList.remove('pulse-page-enter'), 320);

  // Intercept all nav links with relative hrefs
  const navLinks = document.querySelectorAll('nav a[href]:not([href="#"])');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Only intercept internal relative links
      if (!href || href.startsWith('http') || href === '#') return;

      e.preventDefault();

      // Add tap scale feedback instantly
      link.style.transform = 'scale(0.88)';
      setTimeout(() => link.style.transform = '', 150);

      // Fade out then navigate
      document.body.classList.add('pulse-page-exit');
      setTimeout(() => {
        window.location.href = href;
      }, 190);
    });
  });

  // Also intercept back-links (DMs back button, etc.)
  const backLinks = document.querySelectorAll('a[aria-label*="Back"]');
  backLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href === '#') return;
      e.preventDefault();
      document.body.classList.add('pulse-page-exit');
      setTimeout(() => { window.location.href = href; }, 190);
    });
  });
}

/* ==========================================================================
   1. Toast Notification System
   ========================================================================== */
function initToast() {
  if (!document.getElementById('pulse-toast')) {
    const toast = document.createElement('div');
    toast.id = 'pulse-toast';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[18px] text-neon-pink" id="toast-icon">check_circle</span>
      <span id="toast-text">Action completed</span>
    `;
    document.body.appendChild(toast);
  }
}

export function showToast(message, icon = 'check_circle', duration = 2400) {
  const toast = document.getElementById('pulse-toast');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast) return;

  toastText.textContent = message;
  toastIcon.textContent = icon;
  toast.classList.add('show');

  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}
window.showToast = showToast;

/* ==========================================================================
   2. Post Likes & Animations
   ========================================================================== */
function initLikeButtons() {
  const likeButtons = document.querySelectorAll('button[aria-label="Like post"], button[aria-label="Like reel"]');

  likeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = btn.querySelector('.material-symbols-outlined');
      const isLiked = btn.dataset.liked === 'true';

      // Find nearby like counter if present
      const card = btn.closest('article') || btn.closest('main');
      const likeCounter = card ? card.querySelector('[data-design-text-token="label-sm"]') || btn.parentElement.querySelector('span.text-label-sm') : null;

      if (!isLiked) {
        btn.dataset.liked = 'true';
        btn.classList.add('text-neon-pink', 'animate-heart-pop');
        btn.classList.remove('text-dark-on-surface', 'text-white');
        if (icon) {
          icon.textContent = 'favorite';
          icon.style.fontVariationSettings = "'FILL' 1";
        }

        if (likeCounter && likeCounter.textContent.includes('like')) {
          const num = parseInt(likeCounter.textContent.replace(/,/g, '')) || 1914;
          likeCounter.textContent = `${(num + 1).toLocaleString()} likes`;
        }
        showToast('Liked post', 'favorite');
      } else {
        btn.dataset.liked = 'false';
        btn.classList.remove('text-neon-pink', 'animate-heart-pop');
        btn.classList.add(card && card.tagName === 'MAIN' ? 'text-white' : 'text-dark-on-surface');
        if (icon) {
          icon.textContent = 'favorite';
          icon.style.fontVariationSettings = "'FILL' 0";
        }

        if (likeCounter && likeCounter.textContent.includes('like')) {
          const num = parseInt(likeCounter.textContent.replace(/,/g, '')) || 1915;
          likeCounter.textContent = `${Math.max(0, num - 1).toLocaleString()} likes`;
        }
      }
    });
  });
}

/* ==========================================================================
   3. Double-tap to Like on Feed & Reels Images
   ========================================================================== */
function initDoubleTapLike() {
  const postImages = document.querySelectorAll('article .aspect-square, .aspect-\\[4\\/5\\]');

  postImages.forEach(container => {
    let lastTap = 0;

    container.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastTap < 320) {
        // Double tap detected
        createFloatingHeart(container, e);
        const card = container.closest('article');
        if (card) {
          const likeBtn = card.querySelector('button[aria-label="Like post"]');
          if (likeBtn && likeBtn.dataset.liked !== 'true') {
            likeBtn.click();
          }
        }
      }
      lastTap = now;
    });
  });
}

function createFloatingHeart(container, e) {
  const rect = container.getBoundingClientRect();
  const heart = document.createElement('span');
  heart.className = 'material-symbols-outlined floating-heart';
  heart.textContent = 'favorite';
  heart.style.fontVariationSettings = "'FILL' 1";

  container.style.position = 'relative';
  container.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 850);
}

/* ==========================================================================
   4. Bookmark / Save Buttons
   ========================================================================== */
function initBookmarkButtons() {
  const saveButtons = document.querySelectorAll('button[aria-label="Save post"], button[aria-label="Save reel"]');

  saveButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = btn.querySelector('.material-symbols-outlined');
      const isSaved = btn.dataset.saved === 'true';

      if (!isSaved) {
        btn.dataset.saved = 'true';
        btn.classList.add('text-electric-purple');
        if (icon) {
          icon.textContent = 'bookmark';
          icon.style.fontVariationSettings = "'FILL' 1";
        }
        showToast('Saved to your collection', 'bookmark');
      } else {
        btn.dataset.saved = 'false';
        btn.classList.remove('text-electric-purple');
        if (icon) {
          icon.textContent = 'bookmark';
          icon.style.fontVariationSettings = "'FILL' 0";
        }
        showToast('Removed from collection', 'bookmark_remove');
      }
    });
  });
}

/* ==========================================================================
   5. Follow / Unfollow Toggles
   ========================================================================== */
function initFollowButtons() {
  const followButtons = document.querySelectorAll('button');

  followButtons.forEach(btn => {
    const text = btn.textContent.trim();
    if (text === 'Follow') {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.textContent.trim() === 'Follow') {
          btn.textContent = 'Following';
          btn.classList.add('bg-dark-surface-container-high', 'text-dark-on-surface');
          btn.classList.remove('bg-gradient-to-r', 'from-electric-purple', 'to-neon-pink');
          showToast('Added to following list', 'person_add');
        } else if (btn.textContent.trim() === 'Following') {
          btn.textContent = 'Follow';
          btn.classList.remove('bg-dark-surface-container-high', 'text-dark-on-surface');
          showToast('Unfollowed', 'person_remove');
        }
      });
    }
  });
}

/* ==========================================================================
   6. Interactive Create Post Modal
   ========================================================================== */
function initCreatePostModal() {
  const createButtons = document.querySelectorAll('button[aria-label="Create Post"]');
  if (!createButtons.length) return;

  // Create Modal HTML
  const modal = document.createElement('div');
  modal.id = 'create-post-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm hidden';
  modal.innerHTML = `
    <div class="relative w-full max-w-[360px] bg-dark-surface border border-dark-outline rounded-2xl p-5 shadow-2xl animate-modal text-dark-on-surface space-y-4">
      <div class="flex items-center justify-between border-b border-dark-outline/40 pb-3">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-neon-pink text-[20px]">add_circle</span>
          <h3 class="font-headline font-bold text-headline-sm-mobile">Create New Post</h3>
        </div>
        <button id="close-post-modal" class="text-dark-on-surface-container hover:text-dark-on-surface p-1 rounded-full">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-label-sm text-dark-on-surface-container mb-1.5 font-semibold">Post Caption</label>
          <textarea id="new-post-caption" rows="3" placeholder="What's happening in your creative world?..." class="w-full bg-dark-surface-container border border-dark-outline rounded-lg p-2.5 text-body-sm text-dark-on-surface placeholder:text-dark-on-surface-container focus:outline-none focus:border-electric-purple resize-none"></textarea>
        </div>

        <div>
          <label class="block text-label-sm text-dark-on-surface-container mb-1.5 font-semibold">Image URL or Preset</label>
          <input type="text" id="new-post-image" placeholder="Paste image URL (optional)" value="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80" class="w-full bg-dark-surface-container border border-dark-outline rounded-lg p-2.5 text-body-sm text-dark-on-surface placeholder:text-dark-on-surface-container focus:outline-none focus:border-electric-purple">
        </div>
      </div>

      <div class="flex items-center justify-end gap-2.5 pt-2">
        <button type="button" id="cancel-post-btn" class="px-4 py-2 text-label-sm font-semibold rounded-lg bg-dark-surface-container hover:bg-dark-surface-container-high transition-colors">
          Cancel
        </button>
        <button type="button" id="submit-post-btn" class="px-5 py-2 text-label-sm font-semibold text-white rounded-lg bg-gradient-to-r from-electric-purple to-neon-pink hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-lg shadow-electric-purple/30">
          <span>Publish</span>
          <span class="material-symbols-outlined text-[16px]">send</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const openModal = () => {
    modal.classList.remove('hidden');
    document.getElementById('new-post-caption').focus();
  };

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  createButtons.forEach(btn => btn.addEventListener('click', openModal));
  document.getElementById('close-post-modal').addEventListener('click', closeModal);
  document.getElementById('cancel-post-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById('submit-post-btn').addEventListener('click', () => {
    const caption = document.getElementById('new-post-caption').value.trim();
    const imageUrl = document.getElementById('new-post-image').value.trim();

    if (!caption && !imageUrl) {
      showToast('Please add a caption or image', 'warning');
      return;
    }

    // If on feed screen, insert new post at top of feed
    const feedContainer = document.querySelector('main section[aria-label="Stories"]')?.parentElement?.querySelector('.space-y-4');
    if (feedContainer) {
      const newCard = document.createElement('article');
      newCard.className = 'border-b border-dark-outline/30 pb-4 bg-dark-surface animate-modal';
      newCard.innerHTML = `
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full story-ring-active">
              <img src="https://lh3.googleusercontent.com/aida/ALJJyrA4600vQecTfr8yi1tix1EbWxbBUO98k5k41HV8Mmz1ZyNN9wFWmmHt7924tWcrPlN9UvjVZyJWY2KbUNXplu7GKaY0lj4l1shGJogZ5jbSbPckS7K8eqB6T2zSIsV9kcIB2KYqR-jid-E_EleSEsTZb1pd_Dljl5_MvUr_tCD9PLTqUjj52Pzxuj2lBl9G1mx9Bl5mDosa_CmuzUOzxoT7kFenuGCoozbsjHvnuc85EnWy" class="w-full h-full object-cover rounded-full">
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-headline text-label-md font-bold text-dark-on-surface">kai.lens</span>
                <span class="text-neon-pink font-bold text-[11px]">• Just now</span>
              </div>
              <span class="text-label-sm text-dark-on-surface-container">Pulse Creator</span>
            </div>
          </div>
        </div>
        ${imageUrl ? `
        <div class="relative w-full aspect-square bg-dark-surface-container overflow-hidden">
          <img src="${imageUrl}" class="w-full h-full object-cover">
        </div>` : ''}
        <div class="p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button type="button" aria-label="Like post" class="text-dark-on-surface hover:text-neon-pink">
                <span class="material-symbols-outlined text-[24px]">favorite</span>
              </button>
              <button type="button" class="text-dark-on-surface hover:text-dark-primary">
                <span class="material-symbols-outlined text-[24px]">chat_bubble</span>
              </button>
            </div>
            <button type="button" aria-label="Save post" class="text-dark-on-surface hover:text-dark-primary">
              <span class="material-symbols-outlined text-[24px]">bookmark</span>
            </button>
          </div>
          <p class="text-dark-on-surface text-label-sm font-semibold">1 like</p>
          <p class="text-dark-on-surface-container text-body-sm">
            <span class="font-semibold text-dark-on-surface">kai.lens</span> ${caption}
          </p>
        </div>
      `;
      feedContainer.prepend(newCard);
      initLikeButtons();
      initDoubleTapLike();
      initBookmarkButtons();
    }

    closeModal();
    document.getElementById('new-post-caption').value = '';
    showToast('Post published successfully!', 'send');
  });
}

/* ==========================================================================
   7. Stories Click Interaction
   ========================================================================== */
function initStories() {
  const storyItems = document.querySelectorAll('section[aria-label="Stories"] .flex-col');

  storyItems.forEach(item => {
    item.addEventListener('click', () => {
      const username = item.querySelector('span')?.textContent || 'User';
      showToast(`Viewing story of ${username}`, 'play_circle');
    });
  });
}

/* ==========================================================================
   8. Search in Direct Messages
   ========================================================================== */
function initDirectMessagesSearch() {
  const searchInput = document.querySelector('input[placeholder*="Search messages"]');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const chatItems = document.querySelectorAll('main a[href*="#"], main .flex.items-center.justify-between.p-3');

    chatItems.forEach(item => {
      const name = item.querySelector('[data-design-text-token="label-md"]')?.textContent.toLowerCase() || '';
      const message = item.querySelector('[data-design-text-token="body-sm"]')?.textContent.toLowerCase() || '';

      if (name.includes(query) || message.includes(query)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

/* ==========================================================================
   9. Search in Explore Screen
   ========================================================================== */
function initExploreSearch() {
  const searchInput = document.querySelector('input[placeholder*="Search tags"]');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (val) {
        showToast(`Searching for "${val}"...`, 'search');
      }
    }
  });
}
