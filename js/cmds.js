let cmds = {
  help(ctx){
    ctx.cmdText += 'Manual will open in a new window.'
    open('https://github.com/molarmanful/learnsim/blob/main/HELP.md')
  },

  src(ctx){
    ctx.cmdText += 'Github repo will open in a new window.'
    open('https://github.com/molarmanful/learnsim')
  },

  list(ctx){
    if(localStorage.length){
      ctx.cmdText += `BRAIN STATES:\n  ${Object.keys(localStorage).join`\n  `}`
    }
    else {
      ctx.cmdText += `No saved brain states.`
    }
  },

  save(ctx, args, mrp){
    if(args.length){
      let name = args[0]
      localStorage.setItem(name, JSON.stringify({
        chain: JSON.stringify(mrp.chain),
        responses: JSON.stringify(mrp.responses),
        edges: JSON.stringify(mrp.edges)
      }))
      ctx.cmdText += `Brain state saved to "${name}".`
    }
    else {
      ctx.cmdText += 'Please provide a name.'
    }
  },

  load(ctx, args, mrp){
    if(args.length){
      let name = args[0]
      if(name in localStorage){
        ctx.cmdText += `Loading brain state "${name}"...\n`
        let parsed = JSON.parse(localStorage.getItem(name))
        let chain = JSON.parse(parsed.chain)
        let responses = JSON.parse(parsed.responses)
        mrp.edges = JSON.parse(parsed.edges)

        for(let k in chain){
          mrp.chain[k] = chain[k].map(s=> new mrp.State(s.x, s.w, s.r))
        }

        for(let k in responses){
          mrp.responses[k] = responses[k].map(s=> new mrp.State(s.x, s.w, s.r))
        }

        ctx.updateGraph()
        ctx.cmdText += `Brain state "${name}" loaded.`
      }
      else {
        ctx.cmdText += `Brain state "${name}" not found. Type "list" to see a list of saved brain states.`
      }
    }
    else {
      ctx.cmdText += 'Please provide a name.'
    }
  },

  remove(ctx, args, mrp){
    if(args.length){
      let name = args[0]
      if(name in localStorage){
        localStorage.removeItem(name)
        ctx.cmdText += `Brain state "${name}" removed.`
      }
      else {
        ctx.cmdText += `Brain state "${name}" not found. Type "list" to see a list of saved brain states.`
      }
    }
    else {
      ctx.cmdText += 'Please provide a name.'
    }
  },

  clear(ctx, args){
    if(args[0] == 1){
      localStorage.clear()
      ctx.cmdText += 'All brain states removed.'
    }
    else {
      ctx.cmdText += 'If you wish to remove ALL brain states, type "clear 1" to confirm.'
    }
  },

  hi(ctx){
    ctx.cmdText += 'hi'
  },

  test(ctx){
    ctx.cmdText += '1\n2\n3'
  },

  echo(ctx, args){
    ctx.cmdText += arg[0]
  }
}

export default cmds
