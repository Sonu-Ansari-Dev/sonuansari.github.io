/* Byte: site cat + chat assistant. Shared by index.html and extras.html.
   Works offline with a built-in knowledge base about Sonu's portfolio.
   Optional: set window.CAT_CHAT_ENDPOINT = 'https://your-proxy/chat' before this script to use an LLM backend
   (POST {messages:[{role,content}]} -> {reply:"..."}). Never put an API key in this file. */
(function () {
    'use strict';
    if (document.getElementById('catCompanion')) return;

    var home = /extras(\.html)?$/.test(location.pathname) ? 'index.html' : '';
    var EMAIL = 'connect' + '@' + 'sonuansari.online';
    var ENDPOINT = window.CAT_CHAT_ENDPOINT || '';
    function sec(id, t) { return { t: t, u: home + '#' + id }; }
    var L = {
        email: { t: '✉ Email', u: 'mailto:' + EMAIL },
        book: { t: '📅 Book a call', u: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3SSPTnM99GQ-qHaMng7_WTDEX9zCxA7T5n1lDGaLJT6KxJD5yme-SLR2Ju6cWaqbeO97OZzmAi?gv=true' },
        linkedin: { t: 'LinkedIn', u: 'https://www.linkedin.com/in/sonu-ansari-88927120a' },
        github: { t: 'GitHub', u: 'https://github.com/Sonu-Ansari-Dev' },
        play: { t: '🐾 Playground', u: 'extras.html' }
    };
    var DEFAULT_CHIPS = ['Experience', 'Skills', 'Streaming project', 'Cost savings', 'Contact'];

    var KB = [
        { short: true, re: /^\s*(hi|hello|hey|hola|namaste|yo|sup)\b/, a: "Meow! I'm Byte, Sonu's site cat. Ask me about his AWS data work, skills, projects, or how to reach him." },
        { short: true, re: /\b(thanks|thank you|thx|cheers|bye|goodbye)\b/, a: "Purr-leasure! If you'd like to talk to the human, email works best.", l: [L.email] },
        { re: /who are you|your name|what are you|are you (a |an )?(bot|ai|real|human|cat)|\bbyte\b/, a: "I'm Byte 🐈, a scripted site cat rather than a full AI. I know what's on this portfolio and I'll point you to Sonu for anything else." },
        { re: /contact|e-?mail|reach|linkedin|github|\bcall\b|meeting|schedule|book|appointment|get in touch|talk to/, a: "Easiest ways to reach Sonu:", l: [L.email, L.book, L.linkedin, L.github] },
        { re: /salary|\bctc\b|compensation|notice period|expected (pay|salary)/, a: "I don't have compensation or notice-period details. Please ask Sonu directly.", l: [L.email] },
        { re: /hire|hiring|available|availability|open to|opportunit|looking for/, a: "Sonu is open to Senior AWS Data Engineer roles: Redshift, Kinesis/streaming, Glue and data-platform work. He's currently a Senior Software Engineer at Zimetrics Technology. For specifics, talk to him directly.", l: [L.book, L.email] },
        { re: /where|location|based|\bgoa\b|india|relocat|remote|time ?zone/, a: "Sonu is based in Goa, India. For remote or relocation arrangements, please ask him directly.", l: [L.email] },
        { re: /certif|cloud practitioner|credential/, a: "Two certifications: AWS Certified Cloud Practitioner and Databricks Certified Associate Data Engineer.", l: [sec('certifications', 'Certifications')] },
        { re: /educat|degree|universit|college|studied|graduat/, a: "Bachelor's degree in Computer Science & Engineering from Goa University." },
        { re: /redshift|warehous|\bsql\b|copy\/unload/, a: "Sonu designs Redshift tables with distribution and sort keys, tunes COPY/UNLOAD, and optimizes complex reporting queries. At Zimetrics he runs concurrent production ETL pipelines (Glue, PySpark, Lambda, Redshift) with zero missed SLAs.", l: [sec('experience', 'Experience')] },
        { re: /kinesis|stream|real-?time|\biot\b|vehicle|telemetry|latency|geofenc|fleet|kafka/, a: "He built an IoT telemetry platform on AWS IoT Core → Kinesis Data Streams → Lambda, tracking 1,000+ vehicles at 10K events/sec with under 30 seconds end-to-end latency and zero data loss. That's 10× better than the original 5-minute SLA. It includes geofencing alerts and Google Maps road snapping.", l: [sec('experience', 'Experience'), L.play] },
        { re: /glue|\betl\b|pipeline|pyspark|spark|step function|orchestrat|airflow|data quality|lambda/, a: "Serverless ETL with Glue, PySpark and Lambda, orchestrated by Step Functions (retry/catch, parallel branches, dead-letter handling). Manual-intervention incidents went from weekly to zero over 12 months, and automated schema, completeness and freshness checks catch silent failures.", l: [sec('demo', 'ETL demo')] },
        { re: /cost|saving|saved|optimi[sz]|80 ?%|\$500|performance/, a: "Sonu profiled and rewrote PySpark jobs (partitioning, broadcast joins, file sizing, AQE) and tuned Redshift loads. Result: about 80% lower cost, roughly $500/month saved." },
        { re: /skill|stack|\btech|tools?\b|language|python|terraform|docker/, a: "Core: Redshift, Kinesis, Glue, Lambda, Step Functions, S3, DynamoDB, Timestream, IoT Core. Also PySpark, Databricks, Delta Lake, Airflow, Kafka, dbt, Python/SQL, Terraform, Docker and CI/CD.", l: [sec('skills', 'Skills')] },
        { re: /experience|\bwork(ed|s|ing)?\b|zimetrics|company|employer|career|\brole\b|years/, a: "Sonu has been a Senior Software Engineer (Cloud & Data, AWS) at Zimetrics Technology since Aug 2022, building data platforms for healthcare and IoT. That's 4+ years on AWS data.", l: [sec('experience', 'Experience')] },
        { re: /project|recogni|award|achievement|android|termux|raspberry|opencv|robot|pathfinding|\biit\b|surveillance/, a: "Side projects: an on-device Android AI assistant (Termux), a Raspberry Pi face-recognition surveillance prototype, and an autonomous pathfinding robot (IIT Bombay national finalist).", l: [sec('projects', 'Projects'), sec('recognition', 'Recognition'), L.play] },
        { re: /demo|playground|interactive|architecture|diagram/, a: "There's a live ETL architecture walkthrough on the main page, and interactive robotics, geofencing and GPS demos in the playground.", l: [sec('demo', 'ETL demo'), L.play] },
        { re: /joke|funny|\bpun\b|meow/, a: "Why did the cat get kicked out of the data lake? Too many paws-itions without a partition key. 😼" },
        { re: /about|summary|introduce|tell me|who is sonu|sonu/, a: "Sonu Ansari is a Senior AWS Data Engineer with 4+ years building production ETL, Kinesis streaming systems and Redshift warehouses. Highlights: 80% cost reduction, 1K+ vehicles streamed with under 30s latency, zero missed SLAs.", l: [sec('about', 'About'), sec('experience', 'Experience')] }
    ];
    var FALLBACK = { a: "I'm a small scripted cat and didn't catch that. Try one of the topics below, or ask Sonu directly.", l: [L.email] };

    // ---------- markup ----------
    var wrap = document.createElement('div');
    wrap.innerHTML = '' +
        '<div class="cat-companion" id="catCompanion">' +
        '<div class="cat-bubble" id="catBubble" aria-hidden="true"></div>' +
        '<button class="cat-figure" id="catFigure" type="button" aria-label="Chat with Byte the cat" aria-expanded="false" aria-controls="catChat">' +
        '<span class="cat-shadow" aria-hidden="true"></span>' +
        '<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">' +
        '<path class="cat-tail" d="M92 92 C 112 92, 116 68, 100 58 C 112 66, 110 86, 92 88 Z" fill="var(--accent)"/>' +
        '<ellipse class="cat-body-fill" cx="60" cy="78" rx="34" ry="24"/>' +
        '<path class="cat-ear" d="M32 46 L24 20 L48 38 Z" fill="var(--accent)"/>' +
        '<path class="cat-ear" d="M88 46 L96 20 L72 38 Z" fill="var(--accent)"/>' +
        '<path d="M35 42 L30 26 L46 37 Z" fill="var(--accent-secondary)" opacity=".55"/>' +
        '<path d="M85 42 L90 26 L74 37 Z" fill="var(--accent-secondary)" opacity=".55"/>' +
        '<circle class="cat-body-fill" cx="60" cy="52" r="26"/>' +
        '<circle class="cat-eye-white" cx="49" cy="50" r="7.5"/><circle class="cat-pupil" id="pupilL" cx="49" cy="50" r="3.4"/><ellipse class="cat-lid" cx="49" cy="50" rx="8" ry="7.5"/>' +
        '<circle class="cat-eye-white" cx="71" cy="50" r="7.5"/><circle class="cat-pupil" id="pupilR" cx="71" cy="50" r="3.4"/><ellipse class="cat-lid" cx="71" cy="50" rx="8" ry="7.5"/>' +
        '<path class="cat-nose" d="M60 58 L57 62 L63 62 Z"/>' +
        '<path class="cat-mouth" d="M60 62 Q60 66 54 66 M60 62 Q60 66 66 66" fill="none" stroke-width="1.6" stroke-linecap="round"/>' +
        '<g stroke="var(--accent-secondary)" stroke-width="1" opacity=".55" stroke-linecap="round"><line x1="24" y1="54" x2="40" y2="52"/><line x1="24" y1="60" x2="40" y2="59"/><line x1="96" y1="54" x2="80" y2="52"/><line x1="96" y1="60" x2="80" y2="59"/></g>' +
        '</svg></button>' +
        '<button class="cat-hide-btn" id="catHideBtn" type="button" aria-label="Hide cat" title="Hide cat">✕</button>' +
        '</div>' +
        '<button class="cat-restore-btn" id="catRestoreBtn" type="button" aria-label="Show cat" title="Show cat">🐾</button>' +
        '<section class="cat-chat" id="catChat" role="dialog" aria-label="Chat with Byte, Sonu\'s site cat" aria-hidden="true">' +
        '<header class="cat-chat-head"><div><strong>Byte 🐾</strong><small>Ask about Sonu\'s work</small></div><button type="button" class="cat-chat-close" id="catChatClose" aria-label="Close chat">✕</button></header>' +
        '<div class="cat-chat-log" id="catLog" aria-live="polite"></div>' +
        '<div class="cat-chat-chips" id="catChips"></div>' +
        '<form class="cat-chat-form" id="catForm" autocomplete="off"><input id="catInput" type="text" maxlength="300" placeholder="Ask about AWS, Kinesis, projects…" aria-label="Your message"><button type="submit" aria-label="Send">➤</button></form>' +
        '</section>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    var $ = function (id) { return document.getElementById(id); };
    var companion = $('catCompanion'), figure = $('catFigure'), bubble = $('catBubble'),
        panel = $('catChat'), log = $('catLog'), chips = $('catChips'), form = $('catForm'),
        input = $('catInput'), pupilL = $('pupilL'), pupilR = $('pupilR');
    var history = [], opened = false, greeted = false, busy = false;

    // ---------- chat ----------
    function addMsg(who, text, links) {
        var d = document.createElement('div');
        d.className = 'cat-msg ' + who;
        var p = document.createElement('p');
        p.textContent = text;
        d.appendChild(p);
        if (links && links.length) {
            var r = document.createElement('div');
            r.className = 'cat-links';
            links.forEach(function (l) {
                var a = document.createElement('a');
                a.href = l.u; a.textContent = l.t;
                if (/^https?:/.test(l.u)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
                r.appendChild(a);
            });
            d.appendChild(r);
        }
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
        return d;
    }
    function setChips(list) {
        chips.innerHTML = '';
        (list || []).forEach(function (t) {
            var b = document.createElement('button');
            b.type = 'button'; b.textContent = t;
            b.addEventListener('click', function () { send(t); });
            chips.appendChild(b);
        });
    }
    function local(text) {
        var s = text.toLowerCase();
        for (var i = 0; i < KB.length; i++) {
            if (KB[i].short && s.length > 24) continue;
            if (KB[i].re.test(s)) return KB[i];
        }
        return FALLBACK;
    }
    function answer(text) {
        if (!ENDPOINT || !window.fetch) return Promise.resolve(local(text));
        var ctl = window.AbortController ? new AbortController() : null;
        var timer = ctl && setTimeout(function () { ctl.abort(); }, 9000);
        return fetch(ENDPOINT, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: history.slice(-10) }), signal: ctl ? ctl.signal : undefined
        }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
          .then(function (d) { if (!d || !d.reply) throw 0; return { a: String(d.reply).slice(0, 1200) }; })
          .catch(function () { return local(text); })
          .then(function (x) { if (timer) clearTimeout(timer); return x; });
    }
    function send(text) {
        text = (text || '').trim();
        if (!text || busy) return;
        busy = true;
        addMsg('user', text);
        history.push({ role: 'user', content: text });
        setChips([]);
        var typing = addMsg('bot', '');
        typing.innerHTML = '<span class="cat-typing" aria-label="Byte is typing"><i></i><i></i><i></i></span>';
        var wait = new Promise(function (res) { setTimeout(res, 500); });
        Promise.all([answer(text), wait]).then(function (r) {
            var x = r[0];
            typing.remove();
            addMsg('bot', x.a, x.l);
            history.push({ role: 'assistant', content: x.a });
            setChips(DEFAULT_CHIPS);
            busy = false;
        });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; send(v); });

    function setOpen(open) {
        opened = open;
        panel.classList.toggle('open', open);
        panel.setAttribute('aria-hidden', String(!open));
        figure.setAttribute('aria-expanded', String(open));
        if (open) {
            bubble.classList.remove('show');
            if (!greeted) {
                greeted = true;
                addMsg('bot', "Meow! I'm Byte 🐈. I can tell you about Sonu's AWS data work, skills and projects, or help you get in touch.");
                setChips(DEFAULT_CHIPS);
            }
            setTimeout(function () { input.focus(); }, 120);
        } else figure.focus();
    }
    figure.addEventListener('click', function () {
        figure.classList.remove('pounce'); void figure.offsetWidth; figure.classList.add('pounce');
        setOpen(!opened);
    });
    $('catChatClose').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && opened) setOpen(false); });

    // ---------- personality ----------
    var tipTimer = null;
    function speak(text) {
        if (opened) return;
        bubble.textContent = text;
        bubble.classList.add('show');
        clearTimeout(tipTimer);
        tipTimer = setTimeout(function () { bubble.classList.remove('show'); }, 3200);
    }
    var ambient = [
        'Ask me about Sonu\'s Kinesis work 🐾', 'Psst… I know his Redshift tricks.', 'Whisker-based monitoring: all green.',
        'Nine lives, zero downtime.', 'Want his resume highlights? Just ask.', 'Purr-fect pipeline today.'
    ];
    (function nudge() {
        setTimeout(function () {
            if (!document.hidden && !opened) speak(ambient[Math.floor(Math.random() * ambient.length)]);
            nudge();
        }, 25000 + Math.random() * 20000);
    })();
    setTimeout(function () { if (!opened && !companion.classList.contains('hidden')) speak('Hi! Ask me anything about Sonu 🐾'); }, 5000);

    var gazeQueued = false, gx = 0, gy = 0;
    document.addEventListener('mousemove', function (e) {
        gx = e.clientX; gy = e.clientY;
        if (gazeQueued) return;
        gazeQueued = true;
        requestAnimationFrame(function () {
            gazeQueued = false;
            var r = figure.getBoundingClientRect();
            var dx = gx - (r.left + r.width / 2), dy = gy - (r.top + r.height / 2);
            var d = Math.sqrt(dx * dx + dy * dy) || 1, ox = dx / d * 2.6, oy = dy / d * 2.6;
            pupilL.setAttribute('cx', 49 + ox); pupilL.setAttribute('cy', 50 + oy);
            pupilR.setAttribute('cx', 71 + ox); pupilR.setAttribute('cy', 50 + oy);
        });
    }, { passive: true });
    figure.addEventListener('mouseenter', function () { figure.classList.add('notice'); });
    figure.addEventListener('mouseleave', function () { figure.classList.remove('notice'); });

    var scrollTimer = null;
    window.addEventListener('scroll', function () {
        figure.classList.add('scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () { figure.classList.remove('scrolling'); }, 500);
    }, { passive: true });

    (function blink() {
        setTimeout(function () {
            figure.classList.add('blink');
            setTimeout(function () { figure.classList.remove('blink'); blink(); }, 140);
        }, 2600 + Math.random() * 3200);
    })();

    try {
        new MutationObserver(function () {
            speak(document.documentElement.getAttribute('data-theme') === 'light' ? 'Bright mode! Where are my shades? 😎' : 'Back to the dark side. Cozy. 🌙');
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) {}

    // ---------- hide / restore ----------
    var restore = $('catRestoreBtn');
    function applyHidden(h) {
        companion.classList.toggle('hidden', h);
        restore.classList.toggle('show', h);
        if (h && opened) setOpen(false);
        try { localStorage.setItem('sonu-cat-hidden', h ? '1' : '0'); } catch (e) {}
    }
    $('catHideBtn').addEventListener('click', function (e) { e.stopPropagation(); applyHidden(true); });
    restore.addEventListener('click', function () { applyHidden(false); speak('Hi again! 🐾'); });
    var saved = false;
    try { saved = localStorage.getItem('sonu-cat-hidden') === '1'; } catch (e) {}
    applyHidden(saved);
})();
