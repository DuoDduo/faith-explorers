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

searchicon.addEventListener('click', function () {
  if (searchtoggle.style.display === 'none') {
    searchtoggle.style.display = 'block';
  } else {
    searchtoggle.style.display = 'none';
  }
});

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

// auto type words 

// document.addEventListener("DOMContentLoaded", function () {
//   const options = {
//     strings: ['CWS', 'Coder', 'Designer', 'Programmer'],
//     typeSpeed: 150,
//     backSpeed: 50,
//     backDelay: 3000,
//     loop: true
//   };

//   const multiTextElement = document.querySelector('.multi-text');
//   let currentTextIndex = 0;
//   let currentText = '';
//   let isDeleting = false;

//   function type() {
//     const fullText = options.strings[currentTextIndex];
//     if (isDeleting) {
//       currentText = fullText.substring(0, currentText.length - 1);
//     } else {
//       currentText = fullText.substring(0, currentText.length + 1);
//     }

//     multiTextElement.textContent = currentText;

//     let typeSpeed = options.typeSpeed;
//     if (isDeleting) {
//       typeSpeed /= 2; // Faster when deleting
//     }

//     if (!isDeleting && currentText === fullText) {
//       typeSpeed = options.backDelay;
//       isDeleting = true;
//     } else if (isDeleting && currentText === '') {
//       isDeleting = false;
//       currentTextIndex = (currentTextIndex + 1) % options.strings.length;
//     }

//     setTimeout(type, typeSpeed);
//   }

//   type();
// });

// hotcards scroll


const cardWrapper = document.querySelector('.hotcards')
const cardWrapperChildren = Array.from(cardWrapper.children)
const widthToScroll = cardWrapper.children[0].offsetWidth
const arrowPrev = document.querySelector('.leftbtn')
const arrowNext = document.querySelector('.rightbtn')
const cardBounding = cardWrapper.getBoundingClientRect()
const column = Math.floor(cardWrapper.offsetWidth / (widthToScroll + 24))
let currScroll = 0
let initPos = 0
let clicked = false

cardWrapperChildren.slice(-column).reverse().forEach(item => {
  cardWrapper.insertAdjacentHTML('afterbegin', item.outerHTML)
})

cardWrapperChildren.slice(0, column).forEach(item => {
  cardWrapper.insertAdjacentHTML('beforeend', item.outerHTML)
})

const cardImageAndLink = cardWrapper.querySelectorAll('.hcard img, .hcard a')
cardImageAndLink.forEach(item => {
  item.setAttribute('draggable', false)
})

cardWrapper.classList.add('no-smooth')
cardWrapper.scrollLeft = cardWrapper.offsetWidth
cardWrapper.classList.remove('no-smooth')

arrowPrev.onclick = function () {
  cardWrapper.scrollLeft -= widthToScroll
}

arrowNext.onclick = function () {
  cardWrapper.scrollLeft += widthToScroll
}

cardWrapper.onmousedown = function (e) {
  cardWrapper.classList.add('grab')
  initPos = e.clientX - cardBounding.left
  currScroll = cardWrapper.scrollLeft
  clicked = true
}

cardWrapper.onmousemove = function (e) {
  if (clicked) {
    const xPos = e.clientX - cardBounding.left
    cardWrapper.scrollLeft = currScroll + -(xPos - initPos)
  }
}

cardWrapper.onmouseup = mouseUpAndLeave
cardWrapper.onmouseleave = mouseUpAndLeave

function mouseUpAndLeave() {
  cardWrapper.classList.remove('grab')
  clicked = false
}

let autoScroll

cardWrapper.onscroll = function () {
  if (cardWrapper.scrollLeft === 0) {
    cardWrapper.classList.add('no-smooth')
    cardWrapper.scrollLeft = cardWrapper.scrollWidth - (2 * cardWrapper.offsetWidth)
    cardWrapper.classList.remove('no-smooth')
  } else if (cardWrapper.scrollLeft === cardWrapper.scrollWidth - cardWrapper.offsetWidth) {
    cardWrapper.classList.add('no-smooth')
    cardWrapper.scrollLeft = cardWrapper.offsetWidth
    cardWrapper.classList.remove('no-smooth')
  }

  if (autoScroll) {
    clearTimeout(autoScroll)
  }

  autoScroll = setTimeout(() => {
    cardWrapper.classList.remove('no-smooth')
    cardWrapper.scrollLeft += widthToScroll
  }, 3000)
}




// navbar toggle 
const navlist = document.querySelector('.navlist');
const checkbox = document.querySelector('#checkbox');

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






