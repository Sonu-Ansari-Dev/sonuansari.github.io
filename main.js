/* Sonu Ansari — shared site JS: theme, nav, reveal, scroll, stats, carousel */
var yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

/* 0. Email de-obfuscation */
(function () {
    var email = 'connect' + '@' + 'sonuansari.online';
    document.querySelectorAll('[data-obf="email"]').forEach(function (el) {
        el.setAttribute('href', 'mailto:' + email);
        if (!/[📧]/.test(el.textContent)) el.textContent = email;
    });
})();

/* 1. Scroll reveal */
window.__siteReady = true;
(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
})();

/* 2. Navbar scroll state */
(function () {
    var nav = document.getElementById('navbar');
    function update() { nav.classList.toggle('scrolled', window.pageYOffset > 100); }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/* 3. Scroll to top */
(function () {
    var btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
        btn.classList.toggle('show', window.pageYOffset > 400);
    }, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();

/* 4. Mobile nav */
(function () {
    var btn = document.getElementById('mobileMenuBtn');
    var menu = document.getElementById('primaryNav');
    if (!btn || !menu) return;
    function close() {
        menu.classList.remove('active');
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function () {
        var open = !menu.classList.contains('active');
        menu.classList.toggle('active', open);
        btn.classList.toggle('active', open);
        btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !btn.contains(e.target)) close();
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180) close(); }, { passive: true });
})();

/* 5. Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') { e.preventDefault(); return; }
        var target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            var menu = document.querySelector('.nav-links');
            if (menu) menu.classList.remove('active');
            var mmb = document.getElementById('mobileMenuBtn');
            if (mmb) mmb.classList.remove('active');
        }
    });
});

/* 6. Stat counters */
(function () {
    function formatCount(val) { return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function animateValue(el, start, end, duration, opts) {
        opts = opts || {};
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var val = Math.floor(eased * (end - start) + start);
            if (progress >= 1 && opts.finalText) el.textContent = opts.finalText;
            else el.textContent = (opts.prefix || '') + formatCount(val) + (opts.suffix || '');
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target.querySelector('.stat-value');
            if (!el) return;
            var txt = el.textContent.trim();
            if (txt === '1K+') animateValue(el, 0, 1000, 1600, { finalText: '1K+' });
            else if (txt.includes('%')) animateValue(el, 0, 80, 1500, { suffix: '%' });
            else if (txt.includes('+')) animateValue(el, 0, 4, 1500, { suffix: '+' });
            else if (txt.includes('<')) animateValue(el, 0, 30, 1500, { prefix: '<', suffix: 's' });
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-item').forEach(function (item) { observer.observe(item); });
})();

/* 7. Theme toggle */
(function () {
    var root = document.documentElement,
        btn = document.getElementById('themeToggle'),
        thumb = document.getElementById('themeToggleThumb');
    if (!btn) return;
    var saved = null; try { saved = localStorage.getItem('sonu-theme'); } catch (e) {}
    var initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    function apply(theme) {
        root.setAttribute('data-theme', theme);
        var mt = document.querySelector('meta[name="theme-color"]');
        if (mt) mt.setAttribute('content', theme === 'light' ? '#f5f7fb' : '#0a0a0f');
        thumb.textContent = theme === 'light' ? '☀' : '☾';
        btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
        try { localStorage.setItem('sonu-theme', theme); } catch (e) {}
    }
    apply(initial);
    btn.addEventListener('click', function () {
        apply(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
})();

/* 8. Experience carousel */
(function () {
    var track = document.getElementById('expTrack');
    if (!track) return;
    var slides = track.querySelectorAll('.exp-slide');
    var total = slides.length;
    track.style.setProperty('--slide-count', total);
    var dots = document.getElementById('expDots').querySelectorAll('.exp-slide-dot');
    var prevBtn = document.getElementById('expPrev');
    var nextBtn = document.getElementById('expNext');
    var current = 0;
    var stepPct = 100 / total;

    function goTo(index) {
        if (index < 0) index = 0;
        if (index >= total) index = total - 1;
        current = index;
        track.style.transform = 'translateX(-' + (current * stepPct) + '%)';
        dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;
    }
    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (d) {
        d.addEventListener('click', function () { goTo(parseInt(d.dataset.index, 10)); });
    });
    document.addEventListener('keydown', function (e) {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '')) return;
        var cr = track.parentNode.getBoundingClientRect();
        if (cr.bottom < 0 || cr.top > window.innerHeight) return;
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });
    var startX = 0, dragging = false;
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
    track.addEventListener('touchend', function (e) {
        if (!dragging) return;
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
        dragging = false;
    }, { passive: true });
    goTo(0);
})();

/* 9. ETL pipeline demo */
(function () {
    var nodes = [].slice.call(document.querySelectorAll('.etl-node'));
    var run = document.getElementById('etlRun');
    if (!run || !nodes.length) return;
    var burst = document.getElementById('etlBurst'),
        reset = document.getElementById('etlReset'),
        status = document.getElementById('etlStatus');
    var eventsEl = document.getElementById('etlEvents'),
        validEl = document.getElementById('etlValid'),
        rowsEl = document.getElementById('etlRows'),
        latEl = document.getElementById('etlLatency'),
        reportsEl = document.getElementById('etlReports'),
        deliveredEl = document.getElementById('etlDelivered');
    var running = false, timer = null, idx = 0;
    var stages = [
        ['Filtering user pool…', null, null, null],
        ['18,420 active subscriptions selected', null, null, null],
        ['Reading high-throughput activity stream…', '10,000', '18,420', null],
        ['Raw events persisted in DynamoDB…', '310,000', '18,420', null],
        ['Lambda parsing + validation…', '310,000', '18,392', null],
        ['Glue / Spark building monthly features…', '310,000', '18,392', '286,740'],
        ['Step Functions coordinating report jobs…', '310,000', '18,392', '286,740'],
        ['Gold tables ready for reporting…', '310,000', '18,392', '286,740'],
        ['Generating observations + motivational badges…', '310,000', '18,392', '286,740'],
        ['Sending personalized emails…', '310,000', '18,392', '286,740']
    ];
    function resetAll() {
        if (timer) clearInterval(timer);
        timer = null; running = false; idx = 0;
        nodes.forEach(function (n) { n.classList.remove('active', 'done'); });
        eventsEl.textContent = '0';
        validEl.textContent = '0';
        rowsEl.textContent = '0';
        latEl.textContent = '—';
        reportsEl.textContent = '0';
        deliveredEl.textContent = '0%';
        status.textContent = 'Ready, filtering active subscribers';
        run.classList.add('active');
    }
    function setNumbers(stage) {
        var d = stages[stage] || [];
        if (d[1]) eventsEl.textContent = d[1];
        if (d[2]) validEl.textContent = d[2];
        if (d[3]) rowsEl.textContent = d[3];
        if (stage >= 8) reportsEl.textContent = '18,392';
        if (stage >= 9) { deliveredEl.textContent = '99.7%'; latEl.textContent = '< 2 min'; }
    }
    function execute() {
        if (running) return;
        resetAll();
        running = true; idx = 0;
        run.classList.remove('active');
        timer = setInterval(function () {
            nodes.forEach(function (n, i) {
                n.classList.toggle('active', i === idx);
                if (i < idx) n.classList.add('done');
            });
            status.textContent = stages[idx][0];
            setNumbers(idx);
            if (idx === 9) {
                nodes.forEach(function (n) { n.classList.remove('active'); n.classList.add('done'); });
                status.textContent = 'Complete, 18,392 personalized reports delivered';
                clearInterval(timer); timer = null; running = false;
                run.classList.add('active');
                return;
            }
            idx++;
        }, 430);
    }
    run.addEventListener('click', execute);
    burst.addEventListener('click', function () {
        resetAll();
        nodes.forEach(function (n) { n.classList.add('done'); });
        eventsEl.textContent = '10,000';
        validEl.textContent = '18,420';
        latEl.textContent = '10K/s';
        status.textContent = 'Live ingest simulated, 10,000 activity events/sec feeding the reporting lake';
    });
    reset.addEventListener('click', resetAll);
    resetAll();
})();

/* 10. Nav scroll-spy: highlight the link for the section in view */
(function () {
    var links = [].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            links.forEach(function (l) { l.classList.remove('active'); });
            var l = map[e.target.id];
            if (l) l.classList.add('active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
})();
