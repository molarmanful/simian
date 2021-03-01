let rand = x=> x[0 | Math.random() * x.length]
let sortby = (xs, f)=> xs.slice().sort((a, b)=> f(b) - f(a))
let rsum = seq=> seq.reduce((a, x)=> a + x.r, 0)


export default class MRP {

  constructor(name, order=4){
    this.name = name
    this.chain = {}
    this.responses = {}
    this.order = order
    this.nodes = new Set()
    this.edges = []
    this.State = State
  }


  find(k, x){
    return this.chain[k].find(a=> a.x == x)
  }

  findResponse(k, x){
    return this.responses[k].find(a=> a.x == x)
  }


  add(key, x, reward=0){
    for(let i in key){
      let k = key.slice(i)
      if(k.length){
        if(!this.chain[k]) this.chain[k] = []

        let s = this.find(k, x)
        if(s) s.w++, s.r += reward
        else this.chain[k].push(s = new State(x, 1, reward))

        let a = encodeURI(k)
        let b = encodeURI(s.x)
        this.pushEdge(a, b, s.w)
      }
    }
  }


  pushEdge(a, b, w, n=1000){
    if(!this.edges.find(x=> x.source == a && x.target == b)){
      let i = this.edges.findIndex(x=> w >= x.weight)
      if(~i || this.edges.length < n){
        this.edges.splice(i, 0, {source: a, target: b, weight: w})
        this.edges.splice(n)
      }
    }
  }

  updateNodes(){
    this.nodes = new Set()
    for(let e of this.edges){
      this.nodes.add(e.source)
      this.nodes.add(e.target)
    }
  }


  addSeq(seq, reward=0){
    seq = seq.concat('\n')
    for(let i in seq){
      let k = seq.slice(Math.max(0, i - this.order), i)
      this.add(k, seq[i], reward)
    }
  }


  addDialogue(query, response, reward=0){
    if(!this.responses[query]) this.responses[query] = []

    let s = this.findResponse(query, response)
    if(s) s.w++, s.r += reward
    else this.responses[query].push(new State(response, 1, reward))

    this.addSeq(query, 1)
    this.addSeq(response, reward)
  }


  getNext(seq){
    seq = seq.slice(-this.order)
    let res = Object.keys(this.chain).filter(x=> seq.slice(-x.length) == x)
    if(res){
      let target = sortby(res, x=> x.length)[0]
      let ss = this.chain[target]
      let xs = []
      for(let s of ss) for(let _ in [...new Array(s.w)]) xs.push(s)
      return rand(xs)
    }
  }


  getSeq(start){
    let next = this.getNext(start)
    if(next && !next.x.match(/[\n.?!]/)) return [next, ...this.getSeq(start + next.x)]
    return next && next.x != '\n' ? [next] : []
  }


  getResponse(query){
    let cands = Object.keys(this.responses)
    if(cands.length){
      let res = stringSimilarity.findBestMatch(query, cands)
      if(res.bestMatch.rating > 0){
        let target = res.bestMatch.target
        let rs = this.responses[target]
        let xs = []
        for(let r of rs) for(let _ in [...new Array(r.w)]) xs.push(r)
        return rand(xs)
      }
    }
  }


  respond(query, n=10){
    let res = this.getResponse(query)
    if(res){
      let x = res.x.slice(0, this.order)
      let xs = [...new Array(n)].map(_=> this.getSeq(x))
      let choice = sortby(xs, rsum)
      return x + choice[0].map(a=> a.x).join``
    }
  }
}


class State {

  constructor(x, w, r){
    this.x = x
    this.w = w
    this.r = r
  }


  toString(){
    return this.x
  }
}
