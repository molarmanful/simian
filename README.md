# [SIMIAN](https://bennyboy.tech/learnsim)

## (Somewhat Interesting Machine with Intelligence of Artificial Nature)

A chatbot that learns from scratch -- with your help!

Made as a final project for Software Art: Text - Spring 2021.

## Context

Throughout the class, I had played around with various forms of text generation using a variety of algorithms like Markov chains and GPT-2. For this final project, I wanted to try creating a chatbot with "exposed parts" which would allow the chatter to directly teach the robot.

Initially, I was hoping to neural networks as the "brain" of SIMIAN, but the limitations of browser performance made this painfully impractical and unresponsive. After some research, I stumbled upon an extension of the Markov model called Markov decision process (MDP). MDPs have an extra parameter for reward, which would allow SIMIAN to undergo some semblance of reinforced learning.

## How it works

SIMIAN consists of two MDPs: one for forming sentences and one for deciding responses. It is up to you (the teacher) to give SIMIAN material and feedback so it can learn to chat. There are two main ways to teach SIMIAN: simply talk to it and teach it phrases, or give it material to read so it can learn. SIMIAN learns character-by-character, which may allow you to teach it non-English languages.

When given a query to respond to, SIMIAN will attempt to match that query with its own knowledge base using Dice coefficient. Rather than trying to optimize for maximum reward (which is what most applications of MDPs do), SIMIAN instead generates multiple responses and picks the response with the highest reward values.

### Design

I went for a rather odd design that mixed elements of "Hollywood hacker terminal" visuals with standard motifs from modern messaging apps. Instead of monospace fonts, I went with a sans-serif font to emphasize the core messaging aspect of the UI over the technical aspect.

## Issues/Limitations

- As much as I love Markov chains and MDPs, they are pretty limited in quality. In an effort to stay front-end-only, I was willing to make that sacrifice.
- The graph visualization becomes pretty computationally expensive, especially as SIMIAN learns more over time.
