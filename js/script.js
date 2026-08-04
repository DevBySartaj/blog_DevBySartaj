// BlogHub — Interactivity

// 1. Theme Toggle - Light / Dark Mode with LocalStorage
const themeBtn = document.getElementById('themeBtn');
const savedTheme = localStorage.getItem('site-theme');
const icon = themeBtn ? themeBtn.querySelector('i') : null;

if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  if (icon) icon.className = 'fa-solid fa-sun';
} else {
  document.body.classList.remove('dark');
  if (icon) icon.className = 'fa-solid fa-moon';
}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');

    if (icon) {
      if (isDark) {
        icon.className = 'fa-solid fa-sun';
        localStorage.setItem('site-theme', 'dark');
      } else {
        icon.className = 'fa-solid fa-moon';
        localStorage.setItem('site-theme', 'light');
      }
    }
  });
}

// ==========================================
// 2. Mobile Navigation Menu Toggle (Right Sidebar Slide + Touch Outside to Close without Dark Overlay)
// ==========================================
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const drawerCloseBtn = document.getElementById('drawerCloseBtn');

if (menuBtn && navLinks) {
  const menuIcon = menuBtn.querySelector('i');

  function toggleMenu() {
    navLinks.classList.toggle('active');

    if (menuIcon) {
      if (navLinks.classList.contains('active')) {
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark');
      } else {
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
      }
    }
  }

  // मेनू बटन क्लिक करने पर
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // अंदर वाले क्लोज़ बटन (X) पर क्लिक करने पर बंद हो जाएगा
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // मेनू के अंदर किसी भी लिंक पर क्लिक करने पर बंद हो जाएगा
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu();
    });
  });

  // 💡 यह है असली जादू: अगर मेनू खुला है और स्क्रीन पर कहीं भी बाहर क्लिक/टच किया, तो मेनू बंद हो जाएगा (बिना डार्क ओवरले के)
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active')) {
      // अगर क्लिक नेविगेशन मेनू या मेनू बटन के अंदर नहीं हुआ है
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        navLinks.classList.remove('active');
        if (menuIcon) {
          menuIcon.classList.remove('fa-xmark');
          menuIcon.classList.add('fa-bars');
        }
      }
    }
  });
}

// 3. Search Modal & Live Search Logic with Filters
const searchModal = document.getElementById('searchModal');
const openSearchBtn = document.getElementById('searchBtn'); // हेडर का सर्च आइकॉन
const closeSearchBtn = document.getElementById('closeSearchBtn') || document.getElementById('modalCloseBtn'); // 'X' बटन
const liveSearchInput = document.getElementById('liveSearchInput');
const modalSearchResults = document.getElementById('modalSearchResults');
const filterButtons = document.querySelectorAll('.filter-pill');

// आपके सभी ब्लॉग आर्टिकल्स की लिस्ट (type के साथ)
const allBlogs = [
  { title: "How to Deploy a Website using Firebase Hosting", category: "DevOps", type: "blogs", link: "/blogpost/blog-firebase.html", desc: "Learn how to deploy your static website easily using Firebase CLI..." },
  { title: "How to Install C/C++ Compiler on Ubuntu", category: "Linux / C++", type: "tutorials", link: "#", desc: "Complete guide on installing GCC, G++ and build-essential packages..." },
  { title: "Modern JavaScript Features You Should Know", category: "Programming", type: "courses", link: "#", desc: "Explore essential ES6+ features like Promises, Async/Await..." },
  { title: "How to Design Scalable Web Applications", category: "System Design", type: "blogs", link: "#", desc: "Key concepts of load balancing, database caching..." }
];

let currentFilter = 'all';

// Modal Open Logic (यहाँ क्लिक करने पर ही फोकस होगा, जिससे मोबाइल पर अपने आप कीबोर्ड नहीं खुलेगा)
if (openSearchBtn && searchModal) {
  openSearchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchModal.classList.add('open');
    searchModal.classList.add('active'); // दोनों सपोर्ट के लिए
    setTimeout(() => {
      if (liveSearchInput) liveSearchInput.focus();
    }, 100); 
  });
}

// Modal Close Logic ('X' बटन)
if (closeSearchBtn && searchModal) {
  closeSearchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchModal.classList.remove('open');
    searchModal.classList.remove('active');
  });
}

// Outside Click to Close
window.addEventListener('click', (e) => {
  if (e.target === searchModal) {
    searchModal.classList.remove('open');
    searchModal.classList.remove('active');
  }
});

// Escape Key to Close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchModal) {
    searchModal.classList.remove('open');
    searchModal.classList.remove('active');
  }
});

// Filter Pills Click Logic
if (filterButtons.length > 0) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
      });

      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      triggerSearch();
    });
  });
}

// Input Typing Event
if (liveSearchInput) {
  liveSearchInput.addEventListener('input', () => {
    triggerSearch();
  });
}

function triggerSearch() {
  if (!liveSearchInput || !modalSearchResults) return;

  const query = liveSearchInput.value.toLowerCase().trim();

  if (query.length < 2) {
    modalSearchResults.innerHTML = `<p class="search-placeholder-text">Type at least 2 characters to search</p>`;
    return;
  }

  // Filter by text query and category type
  const filteredBlogs = allBlogs.filter(blog => {
    const matchesQuery = blog.title.toLowerCase().includes(query) || blog.category.toLowerCase().includes(query);
    const matchesType = currentFilter === 'all' || blog.type === currentFilter;
    return matchesQuery && matchesType;
  });

  if (filteredBlogs.length === 0) {
    modalSearchResults.innerHTML = `<p class="search-placeholder-text">No articles found matching "${query}"</p>`;
    return;
  }

  let htmlOutput = '';
  filteredBlogs.forEach(blog => {
    htmlOutput += `
      <a href="${blog.link}" class="search-result-item" style="display:block; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.03); border-radius:6px; text-decoration:none; color:#fff; transition: background 0.2s;">
        <h5 style="color:#60a5fa; margin-bottom:4px; font-size:1rem;">${blog.title}</h5>
        <p style="font-size:0.8rem; color:#94a3b8;">${blog.category} &bull; <span style="text-transform: uppercase; font-size: 0.7rem; background: rgba(59,130,246,0.2); padding: 2px 6px; border-radius: 4px; color: #60a5fa;">${blog.type}</span></p>
      </a>
    `;
  });

  modalSearchResults.innerHTML = htmlOutput;
}

// 4. Relative Time Calculator (ब्लॉग कितना पुराना है)
function updateRelativeTime() {
  const timeElements = document.querySelectorAll('.time-ago');

  timeElements.forEach((el) => {
    const postDate = new Date(el.getAttribute('data-date'));
    const now = new Date();
    const seconds = Math.floor((now - postDate) / 1000);

    let relativeText = '';

    if (seconds < 60) {
      relativeText = 'Just now';
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      relativeText = `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      relativeText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (seconds < 2592000) {
      const days = Math.floor(seconds / 86400);
      relativeText = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (seconds < 31536000) {
      const months = Math.floor(seconds / 2592000);
      relativeText = `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(seconds / 31536000);
      relativeText = `${years} year${years > 1 ? 's' : ''} ago`;
    }

    el.innerText = relativeText;
  });
}

document.addEventListener('DOMContentLoaded', updateRelativeTime);

// 5. Real-Time Top Slim Preloader Logic
(function() {
  const loader = document.getElementById('top-preloader');
  if (!loader) return;

  loader.style.width = '30%';

  document.addEventListener('DOMContentLoaded', () => {
    loader.style.width = '70%';
  });

  window.addEventListener('load', () => {
    loader.style.width = '100%';

    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.width = '0%';
      }, 300);
    }, 400);
  });
})();




// ==========================================
// Infinite Marquee Smooth Loop Adjuster
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const tracks = document.querySelectorAll('.marquee-track');
  
  tracks.forEach(track => {
    // हर ट्रैक के अंदर के ओरिजिनल कार्ड्स को डुप्लीकेट करके अंत में जोड़ देंगे ताकि लूप कभी खत्म न हो
    const cards = Array.from(track.children);
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  });
});





