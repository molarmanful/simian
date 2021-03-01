let cmds = {
  help(ctx){
    ctx.cmdText += 'Manual will open in a new window.\n'
    open('https://github.com/molarmanful/learnsim/blob/main/HELP.md')
  },

  src(ctx){
    ctx.cmdText += 'Github repo will open in a new window.\n'
    open('https://github.com/molarmanful/learnsim')
  },

  list(ctx, args, mrp, db){
    db.brains.toArray(xs=>{
      if(xs.length){
        ctx.cmdText += `BRAIN STATES:\n  ${xs.map(x=> x.name).join`\n  `}\n`
      }
      else {
        ctx.cmdText += `No saved brain states.\n`
      }
    })
  },

  save(ctx, args, mrp, db){
    if(args.length){
      let name = args[0]
      db.brains.put({
        name: name,
        chain: mrp.chain,
        responses: mrp.responses,
        edges: mrp.edges
      }).then(_=>{
        ctx.cmdText += `Brain state saved to "${name}".\n`
      }).catch(e=>{
        console.log(e)
        ctx.cmdText += `Brain state unable to be saved, out of memory!\n`
      })
    }
    else {
      ctx.cmdText += 'Please provide a name.\n'
    }
  },

  load(ctx, args, mrp, db){
    if(args.length){
      let name = args[0]
      db.brains.get(name).then(brain=>{
        if(brain){
          ctx.cmdText += `Loading brain state "${name}"...\n`
          let {chain, responses, edges} = brain
          mrp.edges = edges

          for(let k in chain){
            mrp.chain[k] = chain[k].map(s=> new mrp.State(s.x, s.w, s.r))
          }

          for(let k in responses){
            mrp.responses[k] = responses[k].map(s=> new mrp.State(s.x, s.w, s.r))
          }

          ctx.updateGraph()
          ctx.cmdText += `Brain state "${name}" loaded.\n`
        }
        else {
          ctx.cmdText += `Brain state "${name}" not found. Type "list" to see a list of saved brain states.\n`
        }
      }).catch(e=>{
        console.log(e)
      })
    }
    else {
      ctx.cmdText += 'Please provide a name.\n'
    }
  },

  remove(ctx, args, mrp, db){
    if(args.length){
      let name = args[0]
      db.brains.delete(name).then(_=>{
        ctx.cmdText += `Brain state "${name}" removed.\n`
      })
    }
    else {
      ctx.cmdText += 'Please provide a name.\n'
    }
  },

  clear(ctx, args, mrp, db){
    if(args[0] == 1){
      db.brains.clear(_=>{
        ctx.cmdText += 'All brain states removed.\n'
      })
    }
    else {
      ctx.cmdText += 'If you wish to remove ALL brain states, type "clear 1" to confirm.\n'
    }
  },

  graph(ctx){
    ctx.updateGraph()
    ctx.cmdText += 'Graph updated.\n'
  },

  hi(ctx){
    ctx.cmdText += 'hi\n'
  },

  test(ctx){
    ctx.cmdText += '1\n2\n3\n'
  },

  echo(ctx, args){
    ctx.cmdText += args[0] + '\n'
  }
}

export default cmds
