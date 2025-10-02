const scrollButtons = document.querySelectorAll('[data-scroll-to]');
const demoForm = document.getElementById('demo-form');
const demoResult = document.getElementById('demo-result');
const resultList = demoResult?.querySelector('.result__list');
const demoReset = document.getElementById('demo-reset');
const faqList = document.getElementById('faq-list');
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

scrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.scrollTo);
    target?.scrollIntoView({ behavior: 'smooth' });
  });
});

if (faqList) {
  faqList.addEventListener('click', (event) => {
    const trigger = event.target.closest('.accordion__trigger');
    if (!trigger) return;

    const item = trigger.parentElement;
    const content = item?.querySelector('.accordion__content');
    const isExpanded = !content.hasAttribute('hidden');

    faqList.querySelectorAll('.accordion__content').forEach((node) => {
      node.setAttribute('hidden', '');
    });

    faqList.querySelectorAll('.accordion__trigger span').forEach((icon) => {
      icon.textContent = '+';
    });

    if (!isExpanded) {
      content.removeAttribute('hidden');
      trigger.querySelector('span').textContent = '−';
    }
  });
}

if (demoForm && demoResult && resultList && demoReset) {
  demoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(demoForm);
    const goal = formData.get('goal');
    const step = formData.get('step');
    const deadline = formData.get('deadline');
    const notes = formData.get('notes');

    const items = [
      goal && `Meta: ${goal}`,
      step && `Primer paso: ${step}`,
      deadline && `Fecha objetivo: ${new Date(deadline).toLocaleDateString()}`,
      notes && `Notas: ${notes}`,
    ].filter(Boolean);

    resultList.innerHTML = '';
    items.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      resultList.appendChild(li);
    });

    demoForm.setAttribute('hidden', '');
    demoResult.removeAttribute('hidden');
  });

  demoReset.addEventListener('click', () => {
    demoForm.reset();
    demoResult.setAttribute('hidden', '');
    demoForm.removeAttribute('hidden');
    demoForm.querySelector('input')?.focus();
  });
}

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');

    contactStatus.textContent = `¡Listo, ${name}! Enviamos un recordatorio a ${email}*`;
    contactStatus.insertAdjacentHTML(
      'beforeend',
      '<span class="contact__note"> *Solo es un ejemplo, copia el mensaje donde prefieras.</span>'
    );

    contactForm.reset();
    contactForm.querySelector('input')?.focus();
  });
}
