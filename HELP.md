# Manual for SIMIAN

## CMD LINE

This is where you can input basic commands.

```
> help
Opens this manual.

> src
Opens the GitHub repository.
```

## DATA INPUT

Here, you can upload data for SIMIAN to incorporate into its learning process. <kbd>GIVE AS TEXT</kbd> takes your inputted data as the basis for learning to form sentences. <kbd>GIVE AS DIALOGUE</kbd> takes your inputted data as the basis for learning to form responses.

## BOT CHAT

This is where you can talk to SIMIAN directly and directly affect its reward system.

```
/0
"Punish" a response. Use this if you feel a response is unsatisfactory.

/1
"Reward" a response. Use this if you feel a response is of good quality and would like to reinforce it.

/e [message]
"Overwrite" a response. Use this to reinforce responses with your corrected message.
```

Example usage of commands:

```
USER: hello
SIM: hello
USER: /e hi, how are you?
Response recorded.
```

## BRAIN

As SIMIAN learns more and more, the network graph in this window will change and grow to reflect SIMIAN's learning. This visualization is rather computationally expensive, so please be patient if the UI hangs for a bit after uploading large amounts of data.

## Misc. tips

- You can double-click on the titlebars of each window to maximize them.
