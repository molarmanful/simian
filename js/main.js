import MRP from './mrp.js'

const randint = (a, b)=> Math.random() * (b - a + 1) | 0 + a
const mrp = new MRP()
let cy

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
      responding: false,
      windows: [
        {n: 0, class: 'cmd', title: 'CMD LINE'},
        {n: 1, class: 'data', title: 'DATA INPUT'},
        {n: 2, class: 'chat', title: 'BOT CHAT'},
        {n: 3, class: 'net', title: 'BRAIN'}
      ]
    }
  },

  watch: {
    cmdText(){
      setTimeout(_=>{
        let active = document.querySelector('.active')
        active.scrollTop = active.scrollHeight
      })
    },

    chatText(){
      setTimeout(_=>{
        let active = document.querySelector('.active')
        active.scrollTop = active.scrollHeight
      })
    },

    responding(){
      setTimeout(_=>{
        this.focusInput()
      })
    },
  },

  mounted(){
    cy = cytoscape({
      container: document.querySelector('.graph'),
      style: [
        {
          selector: 'node',
          css: {
            // label: 'data(id)',
            'background-color': '#5f4bb6',
            width: '3px',
            height: '3px'
          }
        },
        {
          selector: 'edge',
          css: {
            'line-color': '#5f4bb6',
            width: '1px'
          }
        }
      ]
    })
  },

  methods: {
    focusWindow(n){
      this.active = n
    },

    focusInput(){
      let input = this.$el.querySelector('.active input:not([type="file"]), .active textarea')
      if(input) input.focus()
    },

    maxWindow(){
      this.max = !this.max
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
      if(this.dataText){
        let text = this.dataText.split(/\n+/).map(a=>
          a.replace(/\s+/g, ' ')
        )

        for(let l of text) mrp.addSeq(l)

        this.dataText = ''
        this.updateGraph()
      }
    },

    submitDataDialogue(){
      if(this.dataText){
        let dialogue = this.dataText.split(/\n+/).map(a=>
          a.replace(/^.+[.:]\s+/g, '').replace(/\s+/g, ' ')
        ).filter(a=> a)

        for(let i in dialogue){
          let [a, b] = dialogue.slice(i)
          if(b){
            mrp.addDialogue(a, b)
          }
        }

        this.dataText = ''
        this.updateGraph()
      }
    },

    submitChat(){
      let msg = this.msg
      this.chatText += `USER: ${msg}\n`
      mrp.addSeq(msg)
      this.responding = true

      setTimeout(_=>{
        let response = mrp.respond(msg)
        if(response) this.chatText += `SIM: ${response}\n`
        this.responding = false
      }, randint(100, 500))

      this.msg = ''
    },

    updateGraph(){
      mrp.updateNodes()
      cy.elements().remove()

      for(let x of mrp.nodes){
        if(cy.$id(x).empty()){
          cy.add({data: {id: x}})
        }
      }

      for(let e of mrp.edges){
        cy.add({data: e})
      }

      setTimeout(_=>{
        cy.layout({name: 'cose-bilkent'}).run()
      })
    }
  }
}

const app = Vue.createApp(OS)

app.component('os-window', {
  props: ['win', 'active', 'max'],

  computed: {
    activeClass(){
      return this.win.n == this.active ? 'active' : ''
    }
  },

  template: `
    <div class='window' :class='[win.class, activeClass]' @click='focusWindow(win.n)'>
      <div class='w-inner'>
        <div class='title' @dblclick='$emit("maxWindow")'>{{ win.title }}</div>
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
