import Alpine from 'alpinejs'

Alpine.store('trackerModal', {
  isOpen: false,
  open() {
    this.isOpen = true
    document.body.classList.add('overflow-hidden')
  },
  close() {
    this.isOpen = false
    document.body.classList.remove('overflow-hidden')
  },
})

Alpine.data('alert', function () {
  return {
    isVisible: false,
    dismiss() {
      this.isVisible = false
    },
    init() {
      setTimeout(() => {
        this.isVisible = true
      }, 80)
      setTimeout(() => {
        this.dismiss()
      }, 5000)
    },
  }
})

// Listen to custom window events if needed
window.addEventListener('open-add-tracker', () => {
  Alpine.store('trackerModal').open()
})

window.Alpine = Alpine
Alpine.start()
