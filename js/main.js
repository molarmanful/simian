import MRP from './mrp.js'
import cmds from './cmds.js'
import chat_cmds from './chat_cmds.js'

const randint = (a, b)=> Math.random() * (b - a + 1) | 0 + a
const mrp = new MRP()
let cy

const OS = {
  data(){
    return {
      active: 0,
      max: false,
      cmd: '',
      cmdText: 'SIMIAN v0.0.1\nType "help" for a manual.\n\n',
      dataText: '',
      msg: '',
      lastMsg: '',
      lastResponse: '',
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
      this.bottom(document.querySelector('.active input, .active textarea'))
    },

    chatText(){
      this.bottom(document.querySelector('.active input, .active textarea'))
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

    bottom(el){
      setTimeout(_=>{
        let parent = el.closest('.window').querySelector('.text')
        parent.scrollTop = parent.scrollHeight
      })
    },

    submitCmd(){
      this.cmdText += `> ${this.cmd}\n`
      let parsed = this.cmd.replace(/^\s+/, '').split(/\s+/)

      if(parsed[0]){
        let query = parsed[0].toLowerCase()
        if(cmds[query]){
          cmds[query](this, parsed.slice(1))
        }
        else {
          this.cmdText += `Command '${query}' not found. Type 'help' for a manual.`
        }
      }

      this.cmdText += '\n'
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
        let text = this.dataText.split(/\n(?:\s+)?/).map(a=>
          a.replace(/\s+/g, ' ')
        )

        setTimeout(_=>{
          for(let l of text) mrp.addSeq(l)
          this.updateGraph()
        })

        this.dataText = ''
      }
    },

    submitDataDialogue(){
      if(this.dataText){
        let dialogue = this.dataText.split(/\n(?:\s+)?/).map(a=>
          a.replace(/\s+/g, ' ')
        ).filter(a=> a)

        setTimeout(_=>{
          for(let i in dialogue){
            let [a, b] = dialogue.slice(i)
            if(b){
              mrp.addDialogue(a, b)
            }
          }
          this.updateGraph()
        })

        this.dataText = ''
      }
    },

    submitChat(){
      if(this.msg.replace(/\s+/g, '')){
        let msg = this.msg
        this.chatText += `USER: ${msg}\n`

        if(this.msg[0] == '/'){
          let parsed = this.msg.slice(1).toLowerCase().split(/\s+(.*)/)
          if(chat_cmds[parsed[0]]) chat_cmds[parsed[0]](this, mrp, parsed[1])
        }

        else {
          mrp.addSeq(msg)
          this.responding = true

          setTimeout(_=>{
            let response = mrp.respond(msg)
            if(response) this.chatText += `SIM: ${response}\n`
            else {
              let start = msg.slice(0, mrp.order)
              this.chatText += `SIM: ${response = start + mrp.getSeq(start).map(s=> s.x).join``}\n`
            }
            this.responding = false
            this.lastResponse = response
          }, randint(100, 500))

          this.lastMsg = this.msg
        }
        this.msg = ''
      }
    },

    updateGraph(){
      mrp.updateNodes()
      cy.elements().remove()

      setTimeout(_=>{
        cy.add([...mrp.nodes].map(x=> ({data: {id: x}})))
        cy.add(mrp.edges.map(e=> ({data: e})))
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
