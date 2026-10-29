const toggleCheckbox = document.querySelector('.toggle-checkbox');
const searchtoggle = document.querySelector('.searchclick');
const searchicon = document.querySelector('.fa-magnifying-glass')

// toggleCheckbox.addEventListener('change', function () {
//   if (this.checked) {
//     document.body.classList.add('body');
//   } else {
//     document.body.classList.remove('body');
//   }
// });

// searchicon.addEventListener('click', function () {
//   if (searchtoggle.style.display === 'none') {
//     searchtoggle.style.display = 'block';
//   } else {
//     searchtoggle.style.display = 'none';
//   }
// });

// header scroll
const header = document.getElementById('header');

// Function to handle scroll event
function handleScroll() {
  if (window.scrollY > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// Attach the scroll event listener
window.addEventListener('scroll', handleScroll);




// navbar toggle 
const navlist = document.querySelector('.navlist');
const checkbox = document.getElementById('checkbox');

checkbox.addEventListener('change', function () {
  if (this.checked) {
    checkbox.classList.add('body');
    navlist.style.display = 'block'
  } else {
    checkbox.classList.remove('body');
    navlist.style.display = 'none'
  }
});

class Accordion {
  constructor(el) {
    this.el = el;
    this.summary = el.querySelector('summary');
    this.content = el.querySelector('.faq-content');
    this.expandIcon = this.summary.querySelector('.expand-icon')
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.summary.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(e) {
    e.preventDefault();
    this.el.style.overflow = 'hidden';

    if (this.isClosing || !this.el.open) {
      this.open();
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink() {
    this.isClosing = true;

    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }
    
    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: 400,
      easing: 'ease-out'
    });

    this.animation.onfinish = () => {
      this.expandIcon.setAttribute('src', './sopimages/plus.svg');
      return this.onAnimationFinish(false);
    }
    this.animation.oncancel = () => {
      this.expandIcon.setAttribute('src', './sopimages/plus.svg');
      return this.isClosing = false;
    }
  }

  open() {
    this.el.style.height = `${this.el.offsetHeight}px`;
    this.el.open = true;
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    this.isExpanding = true;

    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight + 
                         this.content.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }
    
    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: 350,
      easing: 'ease-out'
    });

    this.animation.onfinish = () => {
      this.expandIcon.setAttribute(
          'src',
          './sopimages/minus.svg'
      );
      return this.onAnimationFinish(true);
    }
    this.animation.oncancel = () => {
      this.expandIcon.setAttribute(
          'src',
          './sopimages/minus.svg'
      );
      return this.isExpanding = false;
    }
  }

  onAnimationFinish(open) {
    this.el.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.el.style.height = this.el.style.overflow = '';
  }
}

document.querySelectorAll('details').forEach((el) => {
  new Accordion(el);
});






