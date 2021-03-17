document.addEventListener("DOMContentLoaded", function (event) {
  let placeHolder = '/https://'
  if (window.location.pathname.search(/^\/(?:https?:\/\/)?gist\.github\.com/i) === 0) {
      placeHolder += 'gist.github.com'
  } else {
      placeHolder += 'github.com'
  }
  document.querySelectorAll('[href^="/"]').forEach(element => {
    let oldURL = element.getAttribute('href')
    let newURL = placeHolder + oldURL
    element.setAttribute('href', newURL)
  })
  let e = document.querySelector('clipboard-copy.btn.btn-sm')
  if (e) {
    let oldValue = e.getAttribute('value')
    let newValue = 'https://' + window.location.host + '/' + oldValue
    e.setAttribute('value', newValue)
  }
})
