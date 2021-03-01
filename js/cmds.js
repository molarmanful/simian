let cmds = {
  help(ctx){
    ctx.cmdText += 'Manual will open in a new window.'
    open('https://github.com/molarmanful/learnsim/blob/main/HELP.md')
  },

  src(ctx){
    ctx.cmdText += 'Github repo will open in a new window.'
    open('https://github.com/molarmanful/learnsim')
  },

  hi(ctx){
    ctx.cmdText += 'hi'
  },

  test(ctx){
    ctx.cmdText += '1\n2\n3'
  },

  echo(ctx, arg){
    ctx.cmdText += arg[0]
  }
}

export default cmds
