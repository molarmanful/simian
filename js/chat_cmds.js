const chat_cmds = {
  [0](ctx, mrp){
    if(ctx.lastMsg && ctx.lastResponse){
      mrp.addDialogue(ctx.lastMsg, ctx.lastResponse, -1)
      ctx.chatText += 'Reward system adjusted.\n'
    }
  },

  [1](ctx, mrp){
    if(ctx.lastMsg && ctx.lastResponse){
      mrp.addDialogue(ctx.lastMsg, ctx.lastResponse, 1)
      ctx.chatText += 'Reward system adjusted.\n'
    }
  },

  e(ctx, mrp, arg){
    if(arg){
      mrp.addDialogue(ctx.lastMsg, arg.replace(/\s+/g, ' '), 1)
      ctx.chatText += 'Response recorded.\n'
    }
  }
}

export default chat_cmds
