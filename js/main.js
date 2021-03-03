// MODULE IMPORTS

import MRP from './mrp.js'
import cmds from './cmds.js'
import chat_cmds from './chat_cmds.js'

// HELPERS

const randint = (a, b)=> Math.random() * (b - a + 1) | 0 + a
const mrp = new MRP()
const db = new Dexie('brains', {autoOpen: true})
let cy

// VUE PARENT APP

const OS = {

  // NOTABLE PROPERTIES
  // responding: turns off messaging while SIMIAN is thinking

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

    // scrolls terminal to bottom of text log
    cmdText(){
      this.bottom(document.querySelector('.active input, .active textarea'))
    },

    // scrolls chat to bottom of text log
    chatText(){
      this.bottom(document.querySelector('.active input, .active textarea'))
    },

    // focuses input after bot responds
    responding(){
      setTimeout(_=>{
        this.focusInput()
      })
    },
  },

  mounted(){

    // inits graph
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

    // inits indexeddb
    db.version(1).stores({
      brains: 'name, chain, responses, edges'
    })
  },

  methods: {

    // focusWindow(Number)
    // Changes active window.

    focusWindow(n){
      this.active = n
    },

    // focusInput()
    // Focuses input in current window.

    focusInput(){
      let input = this.$el.querySelector('.active input:not([type="file"]), .active textarea')
      if(input) input.focus()
    },

    // maxWindow()
    // Maximizes window (after `dblclick` event).

    maxWindow(){
      this.max = !this.max
    },

    // bottom(Element)
    // Scrolls `.text` elements to the bottom (like a chatbox).

    bottom(el){
      setTimeout(_=>{
        let parent = el.closest('.window').querySelector('.text')
        parent.scrollTop = parent.scrollHeight
      })
    },

    // submitCmd()
    // Parses and interprets command line.
    // SEE `cmd.js` for commands.

    submitCmd(){
      this.cmdText += `> ${this.cmd}\n`
      let parsed = this.cmd.replace(/^\s+/, '').split(/\s+/)

      if(parsed[0]){
        let query = parsed[0].toLowerCase()
        if(cmds[query]){
          cmds[query](this, parsed.slice(1), mrp, db)
        }
        else {
          this.cmdText += `Command '${query}' not found. Type 'help' for a manual.`
        }
      }

      this.cmd = ''
    },

    // drop(Event)
    // Handles `drop` event for files.

    drop(e){
      this.handleFile(e.dataTransfer.files[0])
    },

    // preUpload(Event)
    // Passes click from button to hidden `file` input.

    preUpload(e){
      e.target.closest('.text').querySelector('input[type="file"]').click()
    },

    // upload(Event)
    // Handles `file` input receiving data.

    upload(e){
      if(e.target.files.length) this.handleFile(e.target.files[0])
    },

    // handleFile(File)
    // Reads file (e.g. from `file` input).

    handleFile(file){
      const fr = new FileReader()
      fr.readAsText(file)
      fr.onload = _=>{
        this.dataText = fr.result
      }
    },

    // submitDataText()
    // Adds uploaded data to sentence MRP.

    submitDataText(){
      if(this.dataText){
        let text = this.dataText.replace(/\s+/g, ' ')
        setTimeout(_=>{
          mrp.addSeq(text)
          this.updateGraph()

          this.dataText = ''
        })
      }
    },

    // submitDataText()
    // Adds uploaded data to responses MRP.

    submitDataDialogue(){
      if(this.dataText){
        let dialogue = this.dataText.split(/\n\s*/)
        setTimeout(_=>{
          let c = 0
          for(let i in dialogue){
            // debug msg's for bigger data
            if(++c % 5e4 == 0) console.log(c)

            i = i.replace(/\s+/g, ' ')
            if(i){
              let [a, b] = [dialogue[i], dialogue[i + 1]]
              if(b) mrp.addDialogue(a, b)
            }
          }

          this.updateGraph()
          this.dataText = ''
        })
      }
    },

    // submitChat()
    // Sends + displays user message, then sends + displays bot response.

    submitChat(){
      if(this.msg.replace(/\s+/g, '')){
        let msg = this.msg
        this.chatText += `USER: ${msg}\n`

        // SEE `chat_cmds.js` for chat commands.
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

    // updateGraph()
    // Refreshes graph representation of brain.
    // Shows most frequent `n=1000` edges and corresponding nodes.

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

// WINDOW COMPONENT
// window --(event)--> parent
// window <--(props)-- parent

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

    // focusWindow(Number)
    // Sends `focus-window` event to parent.

    focusWindow(n){
      if(this.win.n == n){
        this.$emit('focusWindow', n)
        this.focusInput()
      }
    },

    // focusInput()
    // Focuses input in current window.

    focusInput(){
      let input = this.$el.querySelector('input:not([type="file"]), textarea')
      if(input) input.focus()
    }
  }
})

app.mount('#app')
