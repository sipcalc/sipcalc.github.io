document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const activeTab = document.querySelector('.nav-link.active');
        if (activeTab) {
            const tabId = activeTab.id.replace('-tab', '');
            triggerCalculation(tabId);
        }
    });

    const triggerCalculation = (tabId) => {
        const form = document.getElementById(`${tabId}-form`);
        if (form) {
            const submitEvent = new Event('submit', { cancelable: true });
            form.dispatchEvent(submitEvent);
        }
    };

    // Trigger calculation for the initial tab
    const initialTab = document.querySelector('.nav-link.active');
    if (initialTab) {
        const initialTabId = initialTab.id.replace('-tab', '');
        triggerCalculation(initialTabId);
    }

    const tabElms = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElms.forEach(tabElm => {
        tabElm.addEventListener('shown.bs.tab', event => {
            const tabId = event.target.id.replace('-tab', '');
            triggerCalculation(tabId);
        });
    });

    // Format number inputs with Indian commas
    document.querySelectorAll('.format-indian-number').forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/,/g, '');
            if (!isNaN(value) && value.length > 0) {
                e.target.value = formatIndianNumber(value);
            }
        });
    });

    // Auto-create sliders for inputs with has-slider
    document.querySelectorAll('.has-slider').forEach(input => {
        const rangeMin = parseFloat(input.getAttribute('data-range-min') || '0');
        const rangeMax = parseFloat(input.getAttribute('data-range-max') || '100');
        const rangeStep = parseFloat(input.getAttribute('data-range-step') || '1');
        const wrapper = document.createElement('div');
        wrapper.className = 'slider-wrapper';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = String(rangeMin);
        slider.max = String(rangeMax);
        slider.step = String(rangeStep);

        // Ensure number input accepts decimals matching slider step
        if (input.type === 'number') {
            input.step = String(rangeStep);
        }

        const isCurrency = input.classList.contains('format-indian-number');
        const parseValue = (val) => isCurrency ? parseIndianNumber(val) : parseFloat(val);
        const formatValue = (num) => isCurrency ? formatIndianNumber(num) : String(num);

        // Initialize slider position from input value
        slider.value = String(parseValue(input.value) || rangeMin);

        // Keep in sync: slider -> input
        slider.addEventListener('input', () => {
            input.value = formatValue(Number(slider.value));
            // Trigger calculation debounced
            const activeTab = document.querySelector('.nav-link.active');
            if (activeTab) {
                const tabId = activeTab.id.replace('-tab', '');
                triggerCalculation(tabId);
            }
        });

        // input -> slider
        input.addEventListener('change', () => {
            const parsed = parseValue(input.value);
            if (!isNaN(parsed)) {
                slider.value = String(parsed);
            }
        });

        // Insert after input
        input.closest('.mb-3')?.appendChild(wrapper);
        wrapper.appendChild(slider);
    });

    // Step-up mode toggle for SIP
    const stepUpMode = document.getElementById('sip-step-up-mode');
    if (stepUpMode) {
        const percentWrap = document.getElementById('sip-step-up-percent-wrap');
        const fixedWrap = document.getElementById('sip-step-up-fixed-wrap');
        const amountLabel = document.getElementById('sip-amount-label');
        const cadenceSel = document.getElementById('sip-cadence');
        const updateUI = () => {
            if (stepUpMode.value === 'percent') {
                percentWrap?.classList.remove('d-none');
                fixedWrap?.classList.add('d-none');
            } else {
                percentWrap?.classList.add('d-none');
                fixedWrap?.classList.remove('d-none');
            }
            if (amountLabel && cadenceSel) {
                amountLabel.textContent = cadenceSel.value === 'weekly' ? 'Weekly Investment' : (cadenceSel.value === 'quarterly' ? 'Quarterly Investment' : 'Monthly Investment');
            }
        };
        stepUpMode.addEventListener('change', updateUI);
        cadenceSel?.addEventListener('change', updateUI);
        updateUI();
    }

    // SWP cadence label update
    const swpCadenceSel = document.getElementById('swp-cadence');
    const swpWithdrawalLabel = document.getElementById('swp-withdrawal-label');
    const updateSwpLabel = () => {
        if (!swpCadenceSel || !swpWithdrawalLabel) return;
        const labelMap = { weekly: 'Weekly Withdrawal', monthly: 'Monthly Withdrawal', quarterly: 'Quarterly Withdrawal' };
        swpWithdrawalLabel.textContent = labelMap[swpCadenceSel.value] || 'Withdrawal';
    };
    swpCadenceSel?.addEventListener('change', updateSwpLabel);
    updateSwpLabel();

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // PNG export buttons (clean export)
    document.querySelectorAll('.btn-export-png').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const container = document.getElementById(targetId);
            if (!container) return;

            const originalScrollY = window.scrollY;
            document.body.classList.add('exporting');
            // Scroll the container into view to ensure images/fonts are loaded
            container.scrollIntoView({ block: 'center' });

            const bg = getComputedStyle(document.body).backgroundColor;
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: bg,
                onclone: (doc) => {
                    doc.body.classList.add('exporting');
                    // Ensure active tab pane is visible in clone
                    const activePanel = doc.getElementById(targetId);
                    if (activePanel) {
                        activePanel.style.display = 'block';
                        activePanel.classList.add('active');
                    }
                }
            });

            const link = document.createElement('a');
            link.download = `${targetId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            document.body.classList.remove('exporting');
            window.scrollTo(0, originalScrollY);
        });
    });
});