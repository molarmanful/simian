import MRP from './mrp.js'

const mrp = new MRP()

const OS = {
  data(){
    return {
      active: 0,
      max: false,
      cmd: '',
      cmdText: '',
      dataText: '',
      msg: '',
      chatText: '',
      windows: [
        {n: 0, class: 'cmd', title: 'CMD LINE'},
        {n: 1, class: 'data', title: 'DATA INPUT'},
        {n: 2, class: 'chat', title: 'BOT CHAT'},
      ]
    }
  },

  watch: {
    cmdText(){
      setTimeout(_=>{
        this.bottom({target: document.activeElement})
      })
    },

    chatText(){
      setTimeout(_=>{
        this.bottom({target: document.activeElement})
      })
    }
  },

  methods: {
    focusWindow(n){
      this.active = n
    },

    bottom(e){
      let parent = e.target.closest('.window').querySelector('.text')
      parent.scrollTop = parent.scrollHeight
    },

    submitCmd(){
      this.cmdText += `> ${this.cmd}\n`
      this.cmd = ''
    },

    drop(e){
      this.handleFile(e.dataTransfer.files[0])
    },

    preUpload(e){
      e.target.closest('.text').querySelector('input[type="file"]').click()
    },

    upload(e){
      if(e.target.files.length) this.handleFile(e.target.files[0])
    },

    handleFile(file){
      const fr = new FileReader()
      fr.readAsText(file)
      fr.onload = _=>{
        this.dataText = fr.result
      }
    },

    submitDataText(){
      
    },

    submitDataDialogue(){
      
    },

    submitChat(){
      this.chatText += `USER: ${this.msg}\n`
      this.msg = ''
    }
  }
}

const app = Vue.createApp(OS)

app.component('os-window', {
  props: ['win', 'active'],

  computed: {
    activeClass(){
      return this.win.n == this.active ? "active" : ""
    }
  },

  template: `
    <div class='window'
         :class='[win.class, activeClass]'
         @click='focusWindow(win.n)'>
      <div class='w-inner'>
        <div class='title'>{{ win.title }}</div>
        <div class='content'><slot></slot></div>
      </div>
    </div>
  `,

  mounted(){
    this.focusWindow(0)
  },

  methods: {
    focusWindow(n){
      if(this.win.n == n){
        this.$emit('focusWindow', n)
        this.focusInput()
      }
    },

    focusInput(){
      let input = this.$el.querySelector('input:not([type="file"]), textarea')
      if(input) input.focus()
    }
  }
})

app.mount('#app')
