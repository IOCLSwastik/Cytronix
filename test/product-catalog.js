/* ===== PRODUCT CATALOG - Interactive Features ===== */
(function () {
    'use strict';

    /* --- Create Lightbox DOM (supports images + video) --- */
    const lb = document.createElement('div');
    lb.className = 'catalog-lightbox';
    lb.innerHTML = `
        <button class="lb-close">&times;</button>
        <button class="lb-prev">&#8249;</button>
        <div class="lb-content">
            <img src="" alt="Product">
            <iframe src="" allow="encrypted-media" allowfullscreen></iframe>
        </div>
        <button class="lb-next">&#8250;</button>
        <div class="lb-counter"></div>
    `;
    document.body.appendChild(lb);

    var lbSlides = []; // array of {type:'image',src:''} or {type:'video',id:''}
    var lbIndex = 0;

    function lbShow(slides, index) {
        lbSlides = slides;
        lbIndex = index || 0;
        lbUpdate();
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function lbHide() {
        lb.classList.remove('active');
        document.body.style.overflow = '';
        // Stop any playing video
        lb.querySelector('iframe').src = '';
    }

    function lbUpdate() {
        var slide = lbSlides[lbIndex];
        var img = lb.querySelector('img');
        var iframe = lb.querySelector('iframe');

        if (slide.type === 'image') {
            img.src = slide.src;
            img.style.display = '';
            iframe.style.display = 'none';
            iframe.src = '';
        } else {
            img.style.display = 'none';
            iframe.style.display = '';
            iframe.src = 'https://www.youtube.com/embed/' + slide.id + '?rel=0&modestbranding=1';
        }

        lb.querySelector('.lb-counter').textContent = (lbIndex + 1) + ' / ' + lbSlides.length;
        lb.querySelector('.lb-prev').style.display = lbSlides.length > 1 ? '' : 'none';
        lb.querySelector('.lb-next').style.display = lbSlides.length > 1 ? '' : 'none';
    }

    lb.querySelector('.lb-close').addEventListener('click', lbHide);
    lb.querySelector('.lb-prev').addEventListener('click', function (e) {
        e.stopPropagation();
        lbIndex = (lbIndex - 1 + lbSlides.length) % lbSlides.length;
        lbUpdate();
    });
    lb.querySelector('.lb-next').addEventListener('click', function (e) {
        e.stopPropagation();
        lbIndex = (lbIndex + 1) % lbSlides.length;
        lbUpdate();
    });
    lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.classList.contains('lb-content')) lbHide();
    });

    // Helper: build slides array from images + video
    function buildSlides(images, videoId) {
        var slides = [];
        (images || []).forEach(function (src) {
            slides.push({ type: 'image', src: src });
        });
        if (videoId) {
            slides.push({ type: 'video', id: videoId });
        }
        return slides;
    }

    /* --- Create Detail Popup DOM --- */
    const popup = document.createElement('div');
    popup.className = 'product-popup-overlay';
    popup.innerHTML = `
        <div class="product-popup">
            <button class="product-popup-close">&times;</button>
            <div class="popup-header"><h3 class="popup-title"></h3></div>
            <div class="popup-media"></div>
            <div class="popup-desc"></div>
            <div class="popup-details"></div>
        </div>
    `;
    document.body.appendChild(popup);

    function popupShow(data) {
        popup.querySelector('.popup-title').textContent = data.name;

        // Build media gallery (3 images + 1 video)
        var mediaHtml = '';
        var imgs = data.images || [];
        var allSlides = buildSlides(imgs, data.video);

        imgs.forEach(function (src, i) {
            mediaHtml += '<div class="popup-media-item" data-slide-index="' + i + '"><img src="' + src + '" alt="' + data.name + '"></div>';
        });
        if (data.video) {
            mediaHtml += '<div class="popup-media-item video-item" data-slide-index="' + imgs.length + '"><img src="https://img.youtube.com/vi/' + data.video + '/hqdefault.jpg" alt="Video"><div class="video-play-icon">&#9654;</div></div>';
        }
        popup.querySelector('.popup-media').innerHTML = mediaHtml;

        // Build description
        var descEl = popup.querySelector('.popup-desc');
        if (data.desc && data.desc !== '-') {
            descEl.innerHTML = '<p>' + data.desc + '</p>';
            descEl.style.display = '';
        } else {
            descEl.style.display = 'none';
        }

        // Build detail info
        var detailHtml = '';
        detailHtml += '<div class="popup-detail-item"><div class="label">Price</div><div class="value price-val">₹' + data.price + '</div></div>';
        detailHtml += '<div class="popup-detail-item"><div class="label">Size</div><div class="value">' + (data.size || '-') + '</div></div>';
        detailHtml += '<div class="popup-detail-item"><div class="label">Weight</div><div class="value">' + (data.weight || '-') + '</div></div>';
        popup.querySelector('.popup-details').innerHTML = detailHtml;

        popup.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Bind all media item clicks to open lightbox at correct slide
        popup.querySelectorAll('.popup-media-item').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                var idx = parseInt(el.getAttribute('data-slide-index'));
                lbShow(allSlides, idx);
            });
        });
    }

    function popupHide() {
        popup.classList.remove('active');
        document.body.style.overflow = '';
    }

    popup.querySelector('.product-popup-close').addEventListener('click', popupHide);
    popup.addEventListener('click', function (e) {
        if (e.target === popup) popupHide();
    });

    /* --- Keyboard Support --- */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (lb.classList.contains('active')) { lbHide(); return; }
            if (popup.classList.contains('active')) { popupHide(); return; }
        }
        if (lb.classList.contains('active')) {
            if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbSlides.length) % lbSlides.length; lbUpdate(); }
            if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbSlides.length; lbUpdate(); }
        }
    });

    /* --- Bind Table Rows --- */
    document.querySelectorAll('.catalog-table tbody tr:not(.category-row)').forEach(function (row) {
        // Parse data attributes
        var images = [];
        try { images = JSON.parse(row.getAttribute('data-images') || '[]'); } catch (e) { }
        var video = row.getAttribute('data-video') || '';
        var size = row.getAttribute('data-size') || '-';
        var weight = row.getAttribute('data-weight') || '-';
        var desc = row.getAttribute('data-desc') || '';
        var allSlides = buildSlides(images, video);

        // Get product name and price from cells
        var cells = row.querySelectorAll('td');
        var name = cells[2] ? cells[2].textContent.trim() : '';
        var price = cells[3] ? cells[3].textContent.trim().replace('₹', '').trim() : '';

        // Dynamically build IMAGE cell with 3 thumbnails + 1 video
        var imgCell = cells[1];
        if (imgCell && (images.length > 0 || video)) {
            var thumbHtml = '<div class="media-thumbs">';
            images.forEach(function (src, i) {
                thumbHtml += '<img src="' + src + '" class="media-thumb" data-slide="' + i + '" alt="Product">';
            });
            if (video) {
                thumbHtml += '<div class="media-thumb video-thumb" data-slide="' + images.length + '"><img src="https://img.youtube.com/vi/' + video + '/default.jpg" alt="Video"><span class="thumb-play">&#9654;</span></div>';
            }
            thumbHtml += '</div>';
            imgCell.innerHTML = thumbHtml;
        }

        // Bind thumbnail clicks to open lightbox at that slide
        row.querySelectorAll('.media-thumb').forEach(function (thumb) {
            thumb.addEventListener('click', function (e) {
                e.stopPropagation();
                var slideIdx = parseInt(thumb.getAttribute('data-slide'));
                lbShow(allSlides, slideIdx);
            });
        });

        row.addEventListener('click', function (e) {
            // Don't re-trigger if a thumb was clicked
            if (e.target.closest('.media-thumbs')) return;
            popupShow({ name: name, price: price, size: size, weight: weight, desc: desc, images: images, video: video });
        });
    });

    /* --- Search (optional, only if search input exists) --- */
    var searchInput = document.getElementById('catalogSearch');
    var resultCount = document.getElementById('catalogResultCount');
    if (searchInput) {
        var rows = document.querySelectorAll('.catalog-table tbody tr:not(.category-row)');
        var total = rows.length;
        searchInput.addEventListener('input', function () {
            var q = this.value.toLowerCase().trim();
            var visible = 0;
            rows.forEach(function (r) {
                var match = !q || r.textContent.toLowerCase().includes(q);
                r.style.display = match ? '' : 'none';
                if (match) visible++;
            });
            if (resultCount) resultCount.textContent = 'Showing ' + visible + ' of ' + total;
        });
    }

    /* --- Hash Navigation --- */
    var hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) {
        var tgt = document.getElementById(hash);
        if (tgt) {
            window.addEventListener('load', function () {
                setTimeout(function () {
                    window.scrollTo({ top: tgt.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });
                }, 100);
            });
            tgt.style.background = 'rgba(20,157,221,.2)';
            tgt.style.boxShadow = 'inset 4px 0 0 #149ddd';
            tgt.style.transition = 'background 2s, box-shadow 2s';
            setTimeout(function () { tgt.style.background = ''; tgt.style.boxShadow = ''; }, 5000);
        }
    }

    /* --- Contact Popup --- */
    var cp = document.createElement('div');
    cp.id = 'contactPopup';
    cp.className = 'contact-popup-overlay';
    cp.innerHTML = `
        <div class="contact-popup">
            <button class="contact-popup-close">&times;</button>
            <h3>Contact Us</h3>
            <div class="contact-item">
                <div class="contact-icon">📞</div>
                <div class="contact-info">
                    <div class="contact-label">Phone</div>
                    <a href="tel:+919428944361" class="contact-value">+91 9428944361</a>
                </div>
            </div>
            <div class="contact-item">
                <div class="contact-icon">✉️</div>
                <div class="contact-info">
                    <div class="contact-label">Email</div>
                    <a href="mailto:mishras@swastik-international.com" class="contact-value">mishras@swastik-international.com</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(cp);

    cp.querySelector('.contact-popup-close').addEventListener('click', function () {
        cp.classList.remove('active');
        document.body.style.overflow = '';
    });
    cp.addEventListener('click', function (e) {
        if (e.target === cp) {
            cp.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Auto-fix any meow.com links to open the contact popup instead
    document.querySelectorAll('a[href*="meow.com"]').forEach(function (a) {
        a.href = 'javascript:void(0)';
        a.addEventListener('click', function (e) {
            e.preventDefault();
            cp.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

})();
