// The letter, split across three reading panels by narrative arc — not by
// even length. Bilingual pairs (a Chinese paragraph and its English
// translation) are kept together as adjacent blocks and never split across
// panels. Each block carries a `lang` so the renderer can style Chinese
// passages, the signature, etc.
//
//   I  (left)   — who he is: the sacrifice, his philosophy, what to admire
//   II (centre) — where we come from: language, food, his journey to America
//   III(right)  — showing up, the promise back to him, and the closing

export const LETTER_HEADER = {
  date: 'June 21, 2026',
  en: "Happy Father's Day",
  zh: '父親節快樂',
}

export const PANELS = [
  {
    numeral: 'I',
    heading: 'Everything You Gave Up',
    blocks: [
      { lang: 'greeting', text: 'Dear Dad / 親愛的爸爸,' },
      { lang: 'en', text: "Happy Father's Day. I know it's been a while since I've actually put real thought into something like this instead of just grabbing a card off a shelf, so this year I wanted to do something different. Something real. From a young age, I remember watching you choose us over the things you actually wanted. You love games, you love good food, you love just relaxing, but I've watched you turn all of that down more times than I can count, because work came first, because the family came first. You always say you're doing it for the family. I didn't really get that when I was a kid. I just thought that's what dads do. But I get it now. I know how much you risk, how much you give up, just so we don't have to. I don't always show that I notice. But I notice." },
      { lang: 'en', text: "There's a thing you've told me more times than I can count, actually it might be the thing you've said to me most in my life: “You're not doing this for me. Remember, you're doing this for yourself, for your future.” Honestly, when I was younger I didn't fully understand why you pushed it the way you did. But I know now, you've told me you grew up watching some parents in Taiwan just let their kids roam free, figure life out completely on their own. And you didn't want that for me. You said even though it takes more time, more energy, more arguing with me when I don't want to listen, you'd rather do that than watch me end up somewhere I never had to be. That's not control. That's you trying to save me from something you watched happen to other people. I get it now, Dad. 我懂了。" },
      { lang: 'en', text: "If I'm being honest about what I actually admire in you, yeah, obviously you're hardworking, everyone says that about their dad. But what gets me more is how persuasive you are, and how you basically never quit once you've decided to do something. I've watched you set your mind on a goal and just go after it until it's done, like ninety percent of the time, you get there. And you're so logical about it. Your thought process doesn't get hijacked by emotions the way mine does. You're methodical, clear, deliberate. That's the kind of thinker I actually want to become." },
      { lang: 'en', text: "And then there's the other side of you that honestly cracks me up. You act like a literal kid sometimes, same interests as us, same hobbies, and when you don't want to do something, you'll just say it straight to our faces, no filter. You're way more direct than people probably expect, and somehow that makes me laugh more than it annoys me. It's like getting to see you as a person and not just “Dad” for a second." },
      { lang: 'en', text: "The stuff you've actually taught me sticks with me every single day: keep my room clean, keep my desk clean, keep my surroundings clean, because that's what a clear head looks like. Follow a schedule. Don't lie, don't flounder around, just do things honestly, efficiently, and do them well. That's basically become how I run my whole life now. Every time I sit down at my desk, that's you." },
    ],
  },
  {
    numeral: 'II',
    heading: 'Where We Come From',
    blocks: [
      { lang: 'en', text: "I know what your day to day actually looks like, too. Hours of work, then making time for us at dinner, talking with grandma, always quietly searching for whatever might make us happy, even when it's something you don't even care about yourself. Whatever we ask for, you usually find a way to get it for us, even if it's not your thing at all. I used to just take that for granted. I don't anymore." },
      { lang: 'zh', text: '有些事情真的只有在我們的語言裡才能完整表達。像是你跟阿嬤講話的時候,那種我們之間特有的笑話,還有只有在台語裡才聽得懂的玩笑。你最喜歡吃的就是炒飯,還有台灣菜,有時候也吃中國菜。每次吃飯的時候,那種味道,那種感覺,都讓我想到你,想到家。' },
      { lang: 'en', text: "Some things really can only be said fully in our own language. Like the way you talk with grandma, the jokes that are uniquely ours, the ones that only make sense in Taiwanese. Fried rice is still your go-to, along with Taiwanese dishes, sometimes Chinese dishes too. It was never just about the food. It's the smell of home, the sound of you and grandma talking, the inside jokes that only work in our language. All of that is wrapped up in you, for me." },
      { lang: 'en', text: "It took me getting older to actually understand the money side of things, how much you think about saving, about stocks, about making sure college is covered. I didn't see that as a kid. I see it now, and I really appreciate it." },
      { lang: 'zh', text: '爸,我知道你當初一個人來美國的故事。你為了追求更好的機會,自己一個人完成南加大的學業,身邊沒有什麼人幫忙,真的很不容易。後來你遇到了媽媽,才有了我們這個家。每次想到這些,我都覺得很佩服你。' },
      { lang: 'en', text: "I know the story of you coming to America by yourself, chasing something bigger, trying to build real opportunity. You went through USC completely alone, barely any help, and you built something out of that. Then you met Mom. I think about that a lot, how much you had to figure out on your own at an age not that much older than I am right now. That's not lost on me." },
      { lang: 'en', text: "When you're proud of me, you don't really hide it. You just say it straight, “good job,” kind of low-key, kind of quiet. But I hear it every single time." },
      { lang: 'en', text: "I know we've butted heads, honestly probably more because of me than you. When I'm in the middle of being mad about something, it's really hard for me to walk it back, to admit I'm wrong in the moment. I'm still working on that. But looking back, you're usually right. Usually. (Don't let that go to your head.)" },
    ],
  },
  {
    numeral: 'III',
    heading: 'Showing Up, and the Promise',
    blocks: [
      { lang: 'en', text: "Every recital, every belt test, every random physics tangent I couldn't stop talking about, you were there. Wishing me good luck before I walked out, helping me get ready, building up confidence I didn't have on my own. Every step since I was a little kid, you've shown up. I don't think I've ever actually told you how much that mattered." },
      { lang: 'en', text: "And recently, with the job hunting, the college stress, the late nights I've been pulling, you've shown up for that too. Every time. I don't say it enough, but I see it, and I appreciate every bit of it." },
      { lang: 'en', text: "I've noticed how you are with both me and my sibling, different, but never unequal. I think you hold me to a more grown-up standard because I lock in more, and maybe that means I get more responsibility, more trust. But I've watched you treat us both with the same amount of care. That's not lost on me either." },
      { lang: 'en', text: "There's something I don't think you say out loud, but I feel it anyway. Part of you wishes I could push even further, reach even more. And when I do accomplish something, you're proud, but you're already thinking about the next thing I could reach for. That's not you being hard to please. That's you believing I'm capable of more than I sometimes believe about myself." },
      { lang: 'en', text: "So here's what I want you to know, in case I never say it as clearly as this again: everything I'm doing right now, the colleges, the research emails, the job applications, the late nights, it's not just for me. I'm working this hard because I want to build a future where you and Mom don't have to worry anymore. Where you can finally take the rest you've been putting off for years. Where I get to take care of you the way you've spent my entire life taking care of me. That's the actual goal. Not just getting into a good school. Taking care of you two." },
      { lang: 'en', text: "I know I don't always show this well. I get angry more often than I should, and I know that's hard on you. But I want you to know, I do listen. I take everything you say to heart, even the small stuff, even when I forget to show it. I'm just forgetful sometimes, not ungrateful. Never ungrateful." },
      { lang: 'zh', text: '爸,你辛苦了。謝謝你為我們做的每一件事,不管多小。我愛你。' },
      { lang: 'en', text: "Dad, you've worked so hard. Thank you for every single thing you've done for us, no matter how small it seemed. I love you." },
      { lang: 'signoff', text: "Happy Father's Day," },
      { lang: 'name', text: 'Derrick' },
    ],
  },
]
