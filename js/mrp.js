let rand = x=> x[0 | Math.random() * x.length]
let sortby = (xs, f)=> xs.slice().sort((a, b)=> f(b) - f(a))
let rsum = seq=> seq.reduce((a, x)=> a + x.r, 0)


export default class MRP {

  constructor(name){
    this.name = name
    this.chain = {}
    this.responses = {}
    this.order = 4
  }


  find(k, x){
    return this.chain[k].find(a=> a.x == x)
  }


  add(key, x){
    for(let i in key){
      let k = key.slice(i)
      if(k.length){
        if(!this.chain[k]) this.chain[k] = []

        let s = this.find(k, x)
        if(s) s.w++
        else this.chain[k].push(new State(x, 1, 0))
      }
    }
  }


  addSeq(seq){
    seq = seq.concat('\n')
    for(let i in seq){
      let k = seq.slice(Math.max(0, i - this.order), i)
      this.add(k, seq[i])
    }
  }


  addDialogue(query, response){
    if(!this.responses[query]) this.responses[query] = []
    this.responses[query].push(new State(response, 1, 0))
    this.addSeq(query)
    this.addSeq(response)
  }


  getNext(seq){
    seq = seq.slice(-this.order)
    let res = fuzzysort.go(seq, Object.keys(this.chain))
    if(res.length){
      let target = rand(res.filter(r=> r.score == res[0].score)).target
      let ss = this.chain[target]
      let xs = []
      for(let s of ss) for(let _ in [...new Array(s.w)]) xs.push(s)
      return rand(xs)
    }
  }


  getSeq(start){
    let next = this.getNext(start)
    if(next && next.x != '\n') return [next, ...this.getSeq(start + next.x)]
    else return []
  }


  getResponse(query){
    let res = fuzzysort.go(query, Object.keys(this.responses))
    if(res.length){
      let target = rand(res.filter(r=> r.score == res[0].score)).target
      let rs = this.responses[target]
      let xs = []
      for(let r of rs) for(let _ in [...new Array(r.w)]) xs.push(r)
      return rand(xs)
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
