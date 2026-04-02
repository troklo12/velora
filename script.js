/* =============================================
   VELORA — Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll behavior ---- */
  const navbar = document.querySelector('.velora-navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  /* ---- Mobile menu toggle ---- */
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      mobileToggle.innerHTML = mobileMenu.classList.contains('open')
        ? '<i class="bi bi-x-lg"></i>'
        : '<i class="bi bi-list"></i>';
    });
  }

  /* ---- Scroll-triggered fade-up animations ---- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => observer.observe(el));
  }

  /* ---- Filter sidebar toggle (accordion) ---- */
  document.querySelectorAll('.filter-group-title').forEach(title => {
    title.addEventListener('click', () => {
      title.classList.toggle('collapsed');
      const body = title.nextElementSibling;
      if (body) body.style.display = body.style.display === 'none' ? '' : 'none';
    });
  });

  /* ---- Product accordion (detail page) ---- */
  document.querySelectorAll('.accordion-btn-velora').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-btn-velora').forEach(b => {
        b.classList.remove('open');
        b.nextElementSibling?.classList.remove('show');
      });
      if (!isOpen) {
        btn.classList.add('open');
        body?.classList.add('show');
      }
    });
  });

  /* ---- Product gallery thumbnail switch ---- */
  const thumbs = document.querySelectorAll('.product-thumb');
  const mainImg = document.querySelector('.product-main-image');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImg) {
        mainImg.style.opacity = '0';
        mainImg.style.transition = 'opacity 0.25s';
        setTimeout(() => {
          mainImg.src = thumb.src;
          mainImg.style.opacity = '1';
        }, 200);
      }
    });
  });

  /* ---- Size selector ---- */
  document.querySelectorAll('.size-btn').forEach(btn => {
    if (!btn.classList.contains('sold-out')) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    }
  });

  /* ---- Color selector ---- */
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ---- Add to cart button ---- */
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addToCartBtn.textContent = 'Added to Cart ✓';
      addToCartBtn.style.background = 'var(--olive)';
      const badge = document.querySelector('.cart-badge');
      if (badge) badge.textContent = parseInt(badge.textContent || '0') + 1;
      setTimeout(() => {
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.style.background = '';
      }, 2000);
    });
  }

  /* ---- Wishlist toggle ---- */
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-heart');
        icon.classList.toggle('bi-heart-fill');
        icon.style.color = icon.classList.contains('bi-heart-fill') ? 'var(--burgundy)' : '';
      }
    });
  });

  /* =============================================
     CATALOG SEARCH FILTER (real-time)
     ============================================= */
  const catalogSearch = document.getElementById('catalogSearchInput');
  const productItems = document.querySelectorAll('.product-item-filterable');

  if (catalogSearch && productItems.length > 0) {
    const countEl = document.getElementById('productsCount');

    catalogSearch.addEventListener('input', () => {
      const query = catalogSearch.value.trim().toLowerCase();
      let visible = 0;

      productItems.forEach(item => {
        const name = (item.dataset.name || '').toLowerCase();
        const category = (item.dataset.category || '').toLowerCase();
        const match = !query || name.includes(query) || category.includes(query);
        item.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      if (countEl) {
        countEl.textContent = `${visible} item${visible !== 1 ? 's' : ''}`;
      }
    });
  }

  /* ---- Sort select ---- */
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect && productItems.length > 0) {
    sortSelect.addEventListener('change', () => {
      const grid = document.getElementById('productsGrid');
      if (!grid) return;
      const items = [...productItems].filter(i => i.style.display !== 'none');
      const val = sortSelect.value;

      items.sort((a, b) => {
        const pa = parseFloat(a.dataset.price || 0);
        const pb = parseFloat(b.dataset.price || 0);
        if (val === 'price-asc') return pa - pb;
        if (val === 'price-desc') return pb - pa;
        if (val === 'name-asc') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
        return 0;
      });

      items.forEach(item => grid.appendChild(item));
    });
  }

  /* ---- Filter checkboxes ---- */
  document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  function applyFilters() {
    const checkedCategories = [...document.querySelectorAll('.filter-cat:checked')].map(c => c.value);
    const checkedSizes = [...document.querySelectorAll('.filter-size:checked')].map(c => c.value);

    let visible = 0;
    productItems.forEach(item => {
      const cat = item.dataset.category || '';
      const sizes = (item.dataset.sizes || '').split(',');

      const catMatch = checkedCategories.length === 0 || checkedCategories.includes(cat);
      const sizeMatch = checkedSizes.length === 0 || checkedSizes.some(s => sizes.includes(s));

      const show = catMatch && sizeMatch;
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const countEl = document.getElementById('productsCount');
    if (countEl) countEl.textContent = `${visible} item${visible !== 1 ? 's' : ''}`;
  }

  /* =============================================
     STYLIST REQUEST FORM VALIDATION
     ============================================= */
  const stylistForm = document.getElementById('stylistForm');

  if (stylistForm) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const russianEnglishBetweenAtAndDotRegex = /^[a-zA-Zа-яА-Я]+$/;
    const phoneRegex = /^[+]?[\d\s\-().]{7,18}$/;
     

    stylistForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect fields
      const name = document.getElementById('formName');
      const email = document.getElementById('formEmail');
      const phone = document.getElementById('formPhone');
      const style = document.getElementById('formStyle');
      const size = document.getElementById('formSize');
      const budget = document.getElementById('formBudget');
      const message = document.getElementById('formMessage');

      let valid = true;

      // Reset
      [name, email, phone, style, size, budget, message].forEach(f => {
        if (f) f.classList.remove('is-invalid');
      });

      // Validate required fields
      if (!name?.value.trim()) { name?.classList.add('is-invalid'); valid = false; }

      if (!email?.value.trim() || !emailRegex.test(email.value.trim())) {
           email?.classList.add('is-invalid');
           valid = false;
         } else {
           // Дополнительная проверка для части между "@" и "."
           const emailParts = email.value.trim().split('@');
         
           if (emailParts.length === 2) {
             const domainPart = emailParts[1]; // после "@"  
             const domainSegments = domainPart.split('.'); // разделяем по точке
             if (domainSegments.length >= 2) {
               const betweenAtAndDot = domainSegments[0]; // часть между "@" и "."
               if (!russianEnglishBetweenAtAndDotRegex.test(betweenAtAndDot)) {
                 email?.classList.add('is-invalid');
                 valid = false;
               }
             } else {
               // если нет точки после "@" — неправильный формат
               email?.classList.add('is-invalid');
               valid = false;
             }
           } else {
             email?.classList.add('is-invalid');
             valid = false;
           }
         }

      if (!phone?.value.trim() || !phoneRegex.test(phone.value.trim())) {
        phone?.classList.add('is-invalid');
        valid = false;
      }

      if (!style?.value) { style?.classList.add('is-invalid'); valid = false; }
      if (!size?.value.trim()) { size?.classList.add('is-invalid'); valid = false; }
      if (!budget?.value) { budget?.classList.add('is-invalid'); valid = false; }

      if (!valid) {
        showModal('error');
        return;
      }

      // Collect data
      const formData = {
        name: name?.value.trim(),
        email: email?.value.trim(),
        phone: phone?.value.trim(),
        style: style?.value,
        size: size?.value.trim(),
        categories: [...document.querySelectorAll('input[name="categories"]:checked')].map(c => c.value),
        budget: budget?.value,
        message: message?.value.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log('VELORA Stylist Request Submitted:', formData);
      showModal('success');
      stylistForm.reset();
    });

    function showModal(type) {
      const successModal = document.getElementById('successModal');
      const errorModal = document.getElementById('errorModal');
      const modal = type === 'success' ? successModal : errorModal;
      if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      }
    }
  }

  /* ---- Newsletter form ---- */
  document.querySelectorAll('.newsletter-form-js').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      if (input && input.value.trim()) {
        if (btn) {
          btn.textContent = 'Subscribed ✓';
          btn.style.background = 'var(--olive)';
          input.value = '';
          setTimeout(() => {
            btn.textContent = 'Subscribe';
            btn.style.background = '';
          }, 3000);
        }
      }
    });
  });

  /* ---- Pagination ---- */
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('prev-btn') && !btn.classList.contains('next-btn')) {
        document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

});
