(function () {

  window.xs = window.innerWidth <= 1024 ? true : false

  window.mobile = window.innerWidth <= 480 ? true : false

  window.xsHeight = window.innerHeight <= 540 ? true : false

  window.touch = document.querySelector('html').classList.contains('touchevents')

  window.animation = {}

  window.animation.fadeIn = (elem, ms, cb, d = 'block') => {
    if (!elem)
      return;

    elem.style.opacity = 0;
    elem.style.display = d;

    if (ms) {
      var opacity = 0;
      var timer = setInterval(function () {
        opacity += 50 / ms;
        if (opacity >= 1) {
          clearInterval(timer);
          opacity = 1;
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 1;
      if (cb) cb()
    }
  }

  window.animation.fadeOut = (elem, ms, cb) => {
    if (!elem)
      return;

    elem.style.opacity = 1;

    if (ms) {
      var opacity = 1;
      var timer = setInterval(function () {
        opacity -= 50 / ms;
        if (opacity <= 0) {
          clearInterval(timer);
          opacity = 0;
          elem.style.display = "none";
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 0;
      elem.style.display = "none";
      if (cb) cb()
    }
  }

  window.animation.scrollTo = (to, duration) => {
    if (duration <= 0) return;
    const element = document.documentElement,
      difference = to - element.scrollTop,
      perTick = difference / duration * 10;

    setTimeout(function () {
      element.scrollTop = element.scrollTop + perTick;
      window.animation.scrollTo(to, duration - 10);
    }, 10);
  }

  window.animation.visChecker = (el) => {
    let rect = el.getBoundingClientRect()
    return (
      //rect.top >= 0 &&
      //rect.left >= 0 &&
      rect.bottom - el.offsetHeight * .35 <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  window.site = {}

  window.site.form = ({

    init: function () {

      const _th = this,
        inputs = document.querySelectorAll('.common__input, .common__textarea'),
        forms = document.querySelectorAll('form'),
        selectors = document.querySelectorAll('.js-select'),
        choicesArr = [],
        digitsInput = document.querySelectorAll('.js-digits')

      $('.js-phone').mask('+7(999) 999-9999')

      function emptyCheck(event) {
        event.target.value.trim() === '' ?
          event.target.classList.remove('notempty') :
          event.target.classList.add('notempty')
      }
      
      for (let item of inputs) {
        item.addEventListener('keyup', emptyCheck)
        item.addEventListener('blur', emptyCheck)
      }

      if (document.querySelectorAll('.js-common-file').length) {
        let commonFile = document.querySelectorAll('.js-common-fileinput'),
          commonFileDelete = document.querySelectorAll('.js-common-filedelete')

        for (let fileInp of commonFile) {
          fileInp.addEventListener('change', (e) => {
            let el = fileInp.nextElementSibling,
              path = fileInp.value.split('\\'),
              pathName = path[path.length - 1].split('');

            pathName.length >= 30 ?
              pathName = pathName.slice(0, 28).join('') + '...' :
              pathName = pathName.join('')

            el.textContent = pathName;
            el.classList.add('choosed');
          })
        }

        for (let fileDelete of commonFileDelete) {
          fileDelete.addEventListener('click', (e) => {
            let el = fileDelete.previousElementSibling,
              fileInput = fileDelete.previousElementSibling.previousElementSibling;
            el.textContent = el.getAttribute('data-default');
            fileInput.value = '';
            el.classList.remove('choosed');
          })
        }
      }

      for (let form of forms) {
        form.addEventListener('submit', e => !_th.checkForm(form) && e.preventDefault() && e.stopPropagation())
      }

      for (let selector of selectors) {
        let choice = new Choices(selector, {
          searchEnabled: false,
          itemSelectText: '',
          position: 'bottom'
        });
        choicesArr.push(choice);
      }

      for (let digitInput of digitsInput) {
        digitInput.addEventListener('keydown', (e) => {
          let validArr = [46, 8, 9, 27, 13, 110, 190]
          if (validArr.indexOf(e.keyCode) !== -1 ||
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
          }
          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault()
          }
        });
      }

      return this
    },

    checkForm: function (form) {
      let checkResult = true;
      const warningElems = form.querySelectorAll('.warning');

      if (warningElems.length) {
        for (let warningElem of warningElems) {
          warningElem.classList.remove('warning')
        }
      }

      for (let elem of form.querySelectorAll('input, textarea, select')) {
        if (elem.getAttribute('data-req')) {
          switch (elem.getAttribute('data-type')) {
            case 'tel':
              var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'email':
              var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'file':
              if (elem.value.trim() === '') {
                elem.parentNode.classList.add('warning')
                checkResult = false
              }
              break;
            default:
              if (elem.value.trim() === '') {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
          }
        }
      }
      
      for (let item of form.querySelectorAll('input[name^=agreement]')) {
        if (!item.checked) {
          item.classList.add('warning')
          checkResult = false
        }
      }
      return checkResult
    }

  }).init()

  window.site.obj = ({
    
    partners: () => {
      const partnersSwiper = new Swiper('.js-partners', {
        loop: true,
        speed: 700,
        slidesPerView: 5,
        spaceBetween: 50,
        parallax: true,
        navigation: {
          nextEl: '.partners__carover .swiper-button-next',
          prevEl: '.partners__carover .swiper-button-prev',
        },
        breakpoints: {
          1400: {
            spaceBetween: 30
          },
          1300: {
            slidesPerView: 4,
            spaceBetween: 30
          },
          960: {
            slidesPerView: 3,
            spaceBetween: 30
          },
          760: {
            slidesPerView: 2,
            spaceBetween: 30
          },
          575: {
            slidesPerView: 1,
            spaceBetween: 30
          }
        }
      })
    },
    
    map: () => {
      const coords = document.querySelector('.js-map').getAttribute('data-coords').split(','),
            myLatlng = new google.maps.LatLng(+coords[0],+coords[1]), mapOptions = {
              zoom: 17.15,
              center: myLatlng,
              disableDefaultUI: true
            }

      const map = new google.maps.Map(document.querySelector('.js-map'), mapOptions)

      const marker = new google.maps.Marker({
        position: myLatlng,
        icon: 'static/i/pin.png'
      })

      marker.setMap(map)
    },
    
    videos: () => {
      const speakersSwiper = new Swiper('.js-videos', {
        speed: 700,
        slidesPerView: 'auto',
        spaceBetween: 50,
        navigation: {
          nextEl: '.videos__carover .swiper-button-next',
          prevEl: '.videos__carover .swiper-button-prev',
        },
        breakpoints: {
          1560: {
            spaceBetween: 30
          },
          960: {
            spaceBetween: 30,
            slidesPerView: 2
          },
          600: {
            spaceBetween: 30,
            slidesPerView: 1
          }
        }
      })
    },
    
    speakers: () => {
      const speakersSwiper = new Swiper('.js-speakers', {
        speed: 700,
        slidesPerView: 2,
        slidesPerColumn: 2,
        spaceBetween: 50,
        navigation: {
          nextEl: '.program__speakers-carover .swiper-button-next',
          prevEl: '.program__speakers-carover .swiper-button-prev',
        },
        breakpoints: {
          1560: {
            spaceBetween: 30
          },
          1200: {
            slidesPerView: 1,
            slidesPerColumn: 1,
            spaceBetween: 30
          },
          960: {
            slidesPerView: 3,
            slidesPerColumn: 1,
            spaceBetween: 30
          },
          760: {
            slidesPerView: 2,
            slidesPerColumn: 1,
            spaceBetween: 30
          },
          575: {
            slidesPerView: 1,
            slidesPerColumn: 2,
            spaceBetween: 30
          }
        }
      })
    },
    
    search: () => {
      const searchIcon = document.querySelector('.js-search-icon'),
            searchEl = document.querySelector('.js-search'),
            searchInput = document.querySelector('.js-search-input')
      
      function searchBlur() {
        searchEl.classList.remove('open')
        searchInput.removeEventListener('blur', searchBlur)
      }
      
      searchIcon.addEventListener('click', (e) => {
        searchEl.classList.add('open')
        searchInput.focus()
        searchInput.addEventListener('blur', searchBlur)
        e.preventDefault()
      })
    },
    
    init: function () {

      const burgerEl = document.querySelector('.js-burger'),
        html = document.querySelector('html'),
        tweenBg = document.querySelector('.js-tweenbg'),
        headerEl = document.querySelector('.header'),
        headerHeight = parseInt(getComputedStyle(headerEl)['height']),
        toNext = document.querySelector('.js-tonext'),
        elemsToCheck = ['.news__elem-imgover', '.js-scroll-imgover', '.about__steps-elem']

      if (document.querySelector('.js-speakers')) this.speakers()
      
      if (document.querySelector('.js-partners')) this.partners()
      
      if (document.querySelector('.js-map')) this.map()
      
      if (document.querySelector('.js-search')) this.search()
      
      if (document.querySelector('.js-videos')) this.videos()
      
      window.addEventListener('resize', () => {
        window.xs = window.innerWidth <= 960 ? true : false
        window.mobile = window.innerWidth <= 480 ? true : false
        window.xsHeight = window.innerHeight <= 540 ? true : false
      })

      window.addEventListener('scroll', () => {
        const programEl = document.querySelector('.program')
        
        if (programEl.getBoundingClientRect().top - headerHeight <= 0) {
          headerEl.classList.add('transform')
        } else {
          headerEl.classList.remove('transform')
        }
        
        for (let item of elemsToCheck) {
          for (let elem of document.querySelectorAll(item)) {
            if (window.animation.visChecker(elem)) {
              elem.classList.add('visible')
            }
          }
        }
      })

      burgerEl.addEventListener('click', (e) => {
        html.classList.toggle('burgeropen')
        burgerEl.classList.toggle('open')
        e.preventDefault()
      })
      
      if (document.querySelectorAll('.js-tweenbg').length) {
        window.addEventListener('mousemove', (event) => {
          const centerX = Math.round(window.innerWidth / 2),
              centerY = Math.round(window.innerHeight / 2),
              diffX = - (event.clientX - centerX) / centerX,
              diffY = - (event.clientY - centerY) / centerY 
          
          TweenMax.to(
            tweenBg, 
            1, 
            {
              'left': Math.round(tweenBg.getAttribute('data-round') * diffX),
              'top': Math.round(tweenBg.getAttribute('data-round') * diffY), 
              ease:Expo.easeOut
            }
          )
        })
      }
      
      if (toNext) {
        toNext.addEventListener('click', (e) => {
          window.animation.scrollTo(document.querySelector('.program').offsetTop, 1000)
          e.preventDefault()
        })
      }
      
      $('[data-fancybox]').fancybox({
        i18n: {
          en: {
            CLOSE: "Закрыть"
          }
        },
        touch: false
      })
      
      let eventScroll
      try {
        eventScroll = new Event('scroll')
      }
      catch (e) {
        eventScroll = document.createEvent('Event');
        let doesnt_bubble = false,
            isnt_cancelable = false
        eventScroll.initEvent('scroll', doesnt_bubble, isnt_cancelable);
      }
      window.dispatchEvent(eventScroll)
      
      return this
    }
  });

  Pace.on('hide', () => {
    setTimeout(() => {
      window.site.obj.init()
    }, 200)
  })
  
})();
