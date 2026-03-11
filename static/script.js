(function () {
  "use strict";

  const messagesEl = document.getElementById("messages");
  const textInput = document.getElementById("textInput");
  const sendBtn = document.getElementById("sendBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const clearBtn = document.getElementById("clearBtn");
  const langSelect = document.getElementById("lang");

  let sessionId = null;
  let transliterateTimeout = null;
  let recognition = null;
  let audioUnlocked = false;
  let recognitionPausedForTTS = false;

  var UI_STRINGS = {
    en: {
      tagline: "Speak or type in your language",
      language: "Language",
      newChat: "New chat",
      newChatTitle: "Clear session",
      attachBtn: "Attach screenshot or document (PDF, Word)",
      pasteHint: "or paste image (Ctrl+V)",
      placeholder: "Type your message...",
      send: "Send",
      stopPlayback: "Stop",
      stopPlaybackTitle: "Stop voice playback",
      voiceInput: "Voice input",
      listeningTitle: "Listening… Click again to stop",
      micInstruction: "Mic: Click once to turn on (red = listening); it stays on. After you stop speaking for ~2 sec, your question is sent. Click again to turn off. Noise suppression on.",
      inputHint: "Tip: Type in Indian script or Roman — both work. Voice question → voice answer; typed question → text answer only. You can ask questions about any attached screenshot or document.",
      footer: "Session-only memory · No data stored after you leave",
      welcomeTitle: "Namaste!",
      welcomeBody: "Choose a language, then type or use the mic.",
      attachedLabel: "Attached:",
      clearUploads: "Clear",
      shareLink: "🔗 Share link (optional)",
      mobileVoiceHint: "Voice input is not available on this device. Please type your message above."
    },
    hi: {
      tagline: "अपनी भाषा में बोलें या टाइप करें",
      language: "भाषा",
      newChat: "नया चैट",
      newChatTitle: "सत्र साफ़ करें",
      attachBtn: "स्क्रीनशॉट या दस्तावेज़ (PDF, Word) संलग्न करें",
      pasteHint: "या छवि पेस्ट करें (Ctrl+V)",
      placeholder: "अपना संदेश लिखें...",
      send: "भेजें",
      stopPlayback: "रोकें",
      stopPlaybackTitle: "आवाज़ बंद करें",
      voiceInput: "आवाज़ इनपुट",
      listeningTitle: "सुन रहा हूँ… बंद करने के लिए फिर क्लिक करें",
      micInstruction: "माइक: चालू करने के लिए एक बार क्लिक करें (लाल = सुन रहा); बंद करने के लिए फिर क्लिक करें। ~2 सेकंड चुप रहने पर सवाल भेज दिया जाएगा।",
      inputHint: "भारतीय लिपि या रोमन में टाइप कर सकते हैं। आवाज़ में पूछें तो जवाब आवाज़ में; टाइप करें तो लिखित जवाब। संलग्न दस्तावेज़/छवि पर सवाल पूछ सकते हैं।",
      footer: "सिर्फ इस सत्र की मेमोरी · बाहर जाने के बाद कोई डेटा नहीं रखा जाता",
      welcomeTitle: "नमस्ते!",
      welcomeBody: "भाषा चुनें, फिर टाइप करें या माइक इस्तेमाल करें। आवाज़ में पूछें तो आवाज़ में जवाब; टाइप करें तो लिखित जवाब।",
      attachedLabel: "संलग्न:",
      clearUploads: "साफ़ करें",
      shareLink: "🔗 लिंक साझा करें (वैकल्पिक)",
      mobileVoiceHint: "इस डिवाइस पर आवाज़ इनपुट उपलब्ध नहीं है। कृपया ऊपर अपना संदेश टाइप करें।"
    },
    as: {
      tagline: "আপোনাৰ ভাষাত কৈ বা টাইপ কৰক",
      language: "ভাষা",
      newChat: "নতুন চেট",
      newChatTitle: "চেচন পৰিষ্কাৰ কৰক",
      attachBtn: "স্ক্ৰীনশ্বট বা নথিপত্ৰ (PDF, Word) সংলগ্ন কৰক",
      pasteHint: "নাইবা ছবি পেষ্ট কৰক (Ctrl+V)",
      placeholder: "আপোনাৰ বাৰ্তা লিখক...",
      send: "পঠাওক",
      stopPlayback: "বন্ধ কৰক",
      stopPlaybackTitle: "কণ্ঠ বন্ধ কৰক",
      voiceInput: "কণ্ঠ ইনপুট",
      listeningTitle: "শুনি আছো… বন্ধ কৰিবলৈ আকৌ ক্লিক কৰক",
      micInstruction: "মাইক: চালু কৰিবলৈ এবাৰ ক্লিক কৰক (ৰঙা = শুনি আছো); বন্ধ কৰিবলৈ আকৌ ক্লিক কৰক। ~২ ছেকেণ্ড নীৰৱ থাকিলে প্ৰশ্ন পঠোৱা হ’ব।",
      inputHint: "ভাৰতীয় লিপি বা ৰোমানত টাইপ কৰক। কণ্ঠত সুধিলে কণ্ঠত উত্তৰ; টাইপ কৰিলে লিখিত উত্তৰ। সংলগ্ন নথি/ছবিৰ বিষয়ে সুধিব পাৰে।",
      footer: "কেৱল এই চেচনৰ মেমৰি · ওলাই গ’লে কোনো ডেটা সংৰক্ষণ নহয়",
      welcomeTitle: "নমস্কাৰ!",
      welcomeBody: "ভাষা বাছক, তাৰ পিছত টাইপ কৰক বা মাইক ব্যৱহাৰ কৰক। কণ্ঠত সুধিলে কণ্ঠত উত্তৰ; টাইপ কৰিলে লিখিত উত্তৰ।",
      attachedLabel: "সংলগ্ন:",
      clearUploads: "পৰিষ্কাৰ কৰক",
      shareLink: "🔗 লিংক শ্বেয়াৰ কৰক (বৈকল্পিক)",
      mobileVoiceHint: "এই ডিভাইচত কণ্ঠ ইনপুট উপলব্ধ নহয়। অনুগ্ৰহ কৰি ওপৰত আপোনাৰ বাৰ্তা টাইপ কৰক।"
    },
    bn: {
      tagline: "আপনার ভাষায় বলুন বা টাইপ করুন",
      language: "ভাষা",
      newChat: "নতুন চ্যাট",
      newChatTitle: "সেশন সাফ করুন",
      attachBtn: "স্ক্রিনশট বা নথি (PDF, Word) সংযুক্ত করুন",
      pasteHint: "অথবা ছবি পেস্ট করুন (Ctrl+V)",
      placeholder: "আপনার বার্তা লিখুন...",
      send: "পাঠান",
      stopPlayback: "বন্ধ করুন",
      stopPlaybackTitle: "কণ্ঠ বন্ধ করুন",
      voiceInput: "কণ্ঠ ইনপুট",
      listeningTitle: "শুনছি… বন্ধ করতে আবার ক্লিক করুন",
      micInstruction: "মাইক: চালু করতে একবার ক্লিক করুন (লাল = শুনছি); বন্ধ করতে আবার ক্লিক করুন। ~২ সেকেন্ড চুপ থাকলে প্রশ্ন পাঠানো হবে।",
      inputHint: "ভারতীয় লিপি বা রোমানে টাইপ করুন। কণ্ঠে জিজ্ঞাসা করলে কণ্ঠে উত্তর; টাইপ করলে লেখা উত্তর। সংযুক্ত নথি/ছবি সম্পর্কে জিজ্ঞাসা করতে পারেন।",
      footer: "শুধু এই সেশনের মেমরি · চলে গেলে কোনো ডেটা সংরক্ষিত নেই",
      welcomeTitle: "নমস্কার!",
      welcomeBody: "ভাষা বেছে নিন, তারপর টাইপ করুন বা মাইক ব্যবহার করুন। কণ্ঠে জিজ্ঞাসা করলে কণ্ঠে উত্তর।",
      attachedLabel: "সংযুক্ত:",
      clearUploads: "সাফ করুন",
      shareLink: "🔗 লিংক শেয়ার করুন (ঐচ্ছিক)",
      mobileVoiceHint: "এই ডিভাইসে ভয়েস ইনপুট উপলব্ধ নয়। অনুগ্রহ করে উপরে আপনার বার্তা টাইপ করুন।"
    },
    te: {
      tagline: "మీ భాషలో మాట్లాడండి లేదా టైప్ చేయండి",
      language: "భాష",
      newChat: "కొత్త చాట్",
      newChatTitle: "సెషన్ క్లియర్ చేయండి",
      attachBtn: "డాక్యుమెంట్, ఇమేజ్ లేదా వీడియో అటాచ్ చేయండి (గరిష్టం 30 నిమిషాలు)",
      pasteHint: "లేదా ఇమేజ్ పేస్ట్ చేయండి (Ctrl+V)",
      placeholder: "మీ సందేశం టైప్ చేయండి...",
      send: "పంపండి",
      stopPlayback: "ఆపండి",
      stopPlaybackTitle: "వాయిస్ ఆపండి",
      voiceInput: "వాయిస్ ఇన్‌పుట్",
      listeningTitle: "వింటున్నాను… ఆపడానికి మళ్లీ క్లిక్ చేయండి",
      micInstruction: "మైక్: ఆన్ చేయడానికి ఒకసారి క్లిక్ చేయండి (ఎరుపు = వింటున్నాను); ఆఫ్ చేయడానికి మళ్లీ క్లిక్ చేయండి।",
      inputHint: "భారతీయ లిపి లేదా రోమన్‌లో టైప్ చేయండి। వాయిస్‌లో అడిగితే వాయిస్‌లో జవాబు; టైప్ చేస్తే టెక్స్ట్ జవాబు।",
      footer: "ఈ సెషన్ మెమరీ మాత్రమే · వెళ్లిన తర్వాత డేటా నిల్వ చేయబడదు",
      welcomeTitle: "నమస్కారం!",
      welcomeBody: "భాష ఎంచుకోండి, ఆపై టైప్ చేయండి లేదా మైక్ ఉపయోగించండి।",
      attachedLabel: "అటాచ్ చేయబడింది:",
      clearUploads: "క్లియర్",
      mobileVoiceHint: "ఈ డివైస్‌లో వాయిస్ ఇన్‌పుట్ అందుబాటులో లేదు. దయచేసి మీ సందేశాన్ని పైన టైప్ చేయండి."
    },
    mr: {
      tagline: "तुमच्या भाषेत बोला किंवा टाइप करा",
      language: "भाषा",
      newChat: "नवीन चॅट",
      newChatTitle: "सत्र साफ करा",
      attachBtn: "स्क्रीनशॉट किंवा दस्तऐवज (PDF, Word) संलग्न करा",
      pasteHint: "किंवा छवी पेस्ट करा (Ctrl+V)",
      placeholder: "तुमचा संदेश टाइप करा...",
      send: "पाठवा",
      stopPlayback: "थांबवा",
      stopPlaybackTitle: "आवाज थांबवा",
      voiceInput: "आवाज इनपुट",
      listeningTitle: "ऐकत आहे… बंद करण्यासाठी पुन्हा क्लिक करा",
      micInstruction: "मायक: चालू करण्यासाठी एकदा क्लिक करा (लाल = ऐकत आहे); बंद करण्यासाठी पुन्हा क्लिक करा।",
      inputHint: "भारतीय लिपी किंवा रोमनमध्ये टाइप करा। आवाजात विचारल्यास आवाजात उत्तर; टाइप केल्यास मजकूर उत्तर।",
      footer: "फक्त या सत्राची मेमरी · बाहेर गेल्यावर डेटा साठवला जात नाही",
      welcomeTitle: "नमस्कार!",
      welcomeBody: "भाषा निवडा, नंतर टाइप करा किंवा मायक वापरा।",
      attachedLabel: "संलग्न:",
      clearUploads: "साफ करा",
      shareLink: "🔗 लिंक शेअर करा (पर्यायी)"
    },
    ta: {
      tagline: "உங்கள் மொழியில் பேசுங்கள் அல்லது தட்டச்சு செய்யுங்கள்",
      language: "மொழி",
      newChat: "புதிய அரட்டை",
      newChatTitle: "அமர்வை அழி",
      attachBtn: "ஸ்கிரீன்ஷாட் அல்லது ஆவணம் (PDF, Word) இணைக்கவும்",
      pasteHint: "அல்லது படத்தை ஒட்டவும் (Ctrl+V)",
      placeholder: "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...",
      send: "அனுப்பு",
      stopPlayback: "நிறுத்து",
      stopPlaybackTitle: "குரலை நிறுத்து",
      voiceInput: "குரல் உள்ளீடு",
      listeningTitle: "கேட்கிறேன்… நிறுத்த மீண்டும் கிளிக் செய்யுங்கள்",
      micInstruction: "மைக்: இயக்க ஒருமுறை கிளிக் செய்யுங்கள் (சிவப்பு = கேட்கிறேன்); அணைக்க மீண்டும் கிளிக் செய்யுங்கள்।",
      inputHint: "இந்திய லிபி அல்லது ரோமனில் தட்டச்சு செய்யுங்கள்। குரலில் கேட்டால் குரலில் பதில்; தட்டச்சு செய்தால் உரை பதில்।",
      footer: "இந்த அமர்வு நினைவகம் மட்டும் · வெளியேறிய பிறகு தரவு சேமிக்கப்படாது",
      welcomeTitle: "வணக்கம்!",
      welcomeBody: "மொழியைத் தேர்ந்தெடுங்கள், பின்னர் தட்டச்சு செய்யுங்கள் அல்லது மைக் பயன்படுத்துங்கள்।",
      attachedLabel: "இணைக்கப்பட்டது:",
      clearUploads: "அழி",
      shareLink: "🔗 இணைப்பைப் பகிரவும் (விரும்பினால்)",
      mobileVoiceHint: "இந்த சாதனத்தில் குரல் உள்ளீடு கிடைக்கவில்லை. மேலே உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்."
    },
    gu: {
      tagline: "તમારી ભાષામાં બોલો અથવા ટાઇપ કરો",
      language: "ભાષા",
      newChat: "નવી ચેટ",
      newChatTitle: "સત્ર સાફ કરો",
      attachBtn: "સ્ક્રીનશોટ અથવા દસ્તાવેજ (PDF, Word) જોડો",
      pasteHint: "અથવા ઇમેજ પેસ્ટ કરો (Ctrl+V)",
      placeholder: "તમારો સંદેશ ટાઇપ કરો...",
      send: "મોકલો",
      stopPlayback: "બંધ કરો",
      stopPlaybackTitle: "અવાજ બંધ કરો",
      voiceInput: "અવાજ ઇનપુટ",
      listeningTitle: "સાંભળી રહ્યો છું… બંધ કરવા ફરી ક્લિક કરો",
      micInstruction: "માઇક: ચાલુ કરવા એકવાર ક્લિક કરો (લાલ = સાંભળી રહ્યો); બંધ કરવા ફરી ક્લિક કરો।",
      inputHint: "ભારતીય લિપિ અથવા રોમનમાં ટાઇપ કરો। અવાજમાં પૂછો તો અવાજમાં જવાબ; ટાઇપ કરો તો લખાણ જવાબ।",
      footer: "ફક્ત આ સત્રની મેમરી · બહાર જતા ડેટા સંગ્રહિત નથી",
      welcomeTitle: "નમસ્તે!",
      welcomeBody: "ભાષા પસંદ કરો, પછી ટાઇપ કરો અથવા માઇક વાપરો।",
      attachedLabel: "જોડેલ:",
      clearUploads: "સાફ કરો",
      shareLink: "🔗 લિંક શેર કરો (વૈકલ્પિક)",
      mobileVoiceHint: "આ ઉપકરણ પર વૉઇસ ઇનપુટ ઉપલબ્ધ નથી. કૃપા કરીને ઉપર તમારો સંદેશ ટાઇપ કરો."
    },
    kn: {
      tagline: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ",
      language: "ಭಾಷೆ",
      newChat: "ಹೊಸ ಚಾಟ್",
      newChatTitle: "ಸೆಷನ್ ತೆರವುಗೊಳಿಸಿ",
      attachBtn: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಥವಾ ಡಾಕ್ಯುಮೆಂಟ್ (PDF, Word) ಲಗತ್ತಿಸಿ",
      pasteHint: "ಅಥವಾ ಚಿತ್ರ ಪೇಸ್ಟ್ ಮಾಡಿ (Ctrl+V)",
      placeholder: "ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...",
      send: "ಕಳುಹಿಸಿ",
      stopPlayback: "ನಿಲ್ಲಿಸಿ",
      stopPlaybackTitle: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
      voiceInput: "ಧ್ವನಿ ಇನ್‌ಪುಟ್",
      listeningTitle: "ಕೇಳುತ್ತಿದ್ದೇನೆ… ನಿಲ್ಲಿಸಲು ಮತ್ತೆ ಕ್ಲಿಕ್ ಮಾಡಿ",
      micInstruction: "ಮೈಕ್: ಆನ್ ಮಾಡಲು ಒಮ್ಮೆ ಕ್ಲಿಕ್ ಮಾಡಿ (ಕೆಂಪು = ಕೇಳುತ್ತಿದ್ದೇನೆ); ಆಫ್ ಮಾಡಲು ಮತ್ತೆ ಕ್ಲಿಕ್ ಮಾಡಿ।",
      inputHint: "ಭಾರತೀಯ ಲಿಪಿ ಅಥವಾ ರೋಮನ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ। ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿದರೆ ಧ್ವನಿಯಲ್ಲಿ ಉತ್ತರ; ಟೈಪ್ ಮಾಡಿದರೆ ಪಠ್ಯ ಉತ್ತರ।",
      footer: "ಈ ಸೆಷನ್ ಮೆಮೊರಿ ಮಾತ್ರ · ಹೊರಟ ನಂತರ ಡೇಟಾ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ",
      welcomeTitle: "ನಮಸ್ಕಾರ!",
      welcomeBody: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ, ನಂತರ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ।",
      attachedLabel: "ಲಗತ್ತಿಸಲಾಗಿದೆ:",
      clearUploads: "ತೆರವುಗೊಳಿಸಿ",
      shareLink: "🔗 ಲಿಂಕ್ ಶೇರ್ ಮಾಡಿ (ಐಚ್ಛಿಕ)",
      mobileVoiceHint: "ಈ ಸಾಧನದಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೇಲೆ ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ."
    },
    ml: {
      tagline: "നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുകയോ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യുക",
      language: "ഭാഷ",
      newChat: "പുതിയ ചാറ്റ്",
      newChatTitle: "സെഷൻ മായ്ക്കുക",
      attachBtn: "സ്ക്രീൻഷോട്ട് അല്ലെങ്കിൽ ഡോക്യുമെന്റ് (PDF, Word) അറ്റാച്ച് ചെയ്യുക",
      pasteHint: "അല്ലെങ്കിൽ ഇമേജ് പേസ്റ്റ് ചെയ്യുക (Ctrl+V)",
      placeholder: "നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക...",
      send: "അയച്ചുകൊള്ളുക",
      stopPlayback: "നിർത്തുക",
      stopPlaybackTitle: "ശബ്ദം നിർത്തുക",
      voiceInput: "ശബ്ദ ഇൻപുട്ട്",
      listeningTitle: "കേൾക്കുന്നു… നിർത്താൻ വീണ്ടും ക്ലിക്ക് ചെയ്യുക",
      micInstruction: "മൈക്ക്: ഓണാക്കാൻ ഒരിക്കൽ ക്ലിക്ക് ചെയ്യുക (ചുവപ്പ് = കേൾക്കുന്നു); ഓഫ് ചെയ്യാൻ വീണ്ടും ക്ലിക്ക് ചെയ്യുക।",
      inputHint: "ഇന്ത്യൻ ലിപിയിലോ റോമനിലോ ടൈപ്പ് ചെയ്യുക। ശബ്ദത്തിൽ ചോദിച്ചാൽ ശബ്ദത്തിൽ ഉത്തരം; ടൈപ്പ് ചെയ്താൽ ടെക്സ്റ്റ് ഉത്തരം।",
      footer: "ഈ സെഷൻ മെമ്മറി മാത്രം · പോയാൽ ഡാറ്റ സംഭരിക്കില്ല",
      welcomeTitle: "നമസ്കാരം!",
      welcomeBody: "ഭാഷ തിരഞ്ഞെടുക്കുക, പിന്നീട് ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്ക് ഉപയോഗിക്കുക।",
      attachedLabel: "അറ്റാച്ച് ചെയ്തത്:",
      clearUploads: "മായ്ക്കുക",
      shareLink: "🔗 ലിങ്ക് പങ്കിടുക (ഓപ്ഷണൽ)",
      mobileVoiceHint: "ഈ ഉപകരണത്തിൽ വോയ്‌സ് ഇൻപുട്ട് ലഭ്യമല്ല. മുകളിൽ നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക."
    },
    pa: {
      tagline: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਟਾਈਪ ਕਰੋ",
      language: "ਭਾਸ਼ਾ",
      newChat: "ਨਵੀ ਚੈਟ",
      newChatTitle: "ਸੈਸ਼ਨ ਸਾਫ਼ ਕਰੋ",
      attachBtn: "ਸਕ੍ਰੀਨਸ਼ਾਟ ਜਾਂ ਦਸਤਾਵੇਜ਼ (PDF, Word) ਅਟੈਚ ਕਰੋ",
      pasteHint: "ਜਾਂ ਚਿੱਤਰ ਪੇਸਟ ਕਰੋ (Ctrl+V)",
      placeholder: "ਆਪਣਾ ਸੰਦੇਸ਼ ਟਾਈਪ ਕਰੋ...",
      send: "ਭੇਜੋ",
      stopPlayback: "ਰੋਕੋ",
      stopPlaybackTitle: "ਆਵਾਜ਼ ਰੋਕੋ",
      voiceInput: "ਆਵਾਜ਼ ਇਨਪੁੱਟ",
      listeningTitle: "ਸੁਣ ਰਿਹਾ ਹਾਂ… ਰੋਕਣ ਲਈ ਦੁਬਾਰਾ ਕਲਿੱਕ ਕਰੋ",
      micInstruction: "ਮਾਈਕ: ਚਾਲੂ ਕਰਨ ਲਈ ਇੱਕ ਵਾਰ ਕਲਿੱਕ ਕਰੋ (ਲਾਲ = ਸੁਣ ਰਿਹਾ); ਬੰਦ ਕਰਨ ਲਈ ਦੁਬਾਰਾ ਕਲਿੱਕ ਕਰੋ।",
      inputHint: "ਭਾਰਤੀ ਲਿਪੀ ਜਾਂ ਰੋਮਨ ਵਿੱਚ ਟਾਈਪ ਕਰੋ। ਆਵਾਜ਼ ਵਿੱਚ ਪੁੱਛੋ ਤਾਂ ਆਵਾਜ਼ ਵਿੱਚ ਜਵਾਬ; ਟਾਈਪ ਕਰੋ ਤਾਂ ਟੈਕਸਟ ਜਵਾਬ।",
      footer: "ਸਿਰਫ਼ ਇਸ ਸੈਸ਼ਨ ਦੀ ਮੈਮੋਰੀ · ਬਾਹਰ ਜਾਣ ਤੋਂ ਬਾਅਦ ਡਾਟਾ ਸਟੋਰ ਨਹੀਂ ਕੀਤਾ ਜਾਂਦਾ",
      welcomeTitle: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ!",
      welcomeBody: "ਭਾਸ਼ਾ ਚੁਣੋ, ਫਿਰ ਟਾਈਪ ਕਰੋ ਜਾਂ ਮਾਈਕ ਵਰਤੋ।",
      attachedLabel: "ਅਟੈਚ ਕੀਤਾ:",
      clearUploads: "ਸਾਫ਼ ਕਰੋ",
      shareLink: "🔗 ਲਿੰਕ ਸਾਂਝਾ ਕਰੋ (ਵਿਕਲਪਿਕ)",
      mobileVoiceHint: "ਇਸ ਡਿਵਾਈਸ 'ਤੇ ਵੌਇਸ ਇਨਪੁੱਟ ਉਪਲਬਧ ਨਹੀਂ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸੰਦੇਸ਼ ਉੱਪਰ ਟਾਈਪ ਕਰੋ।"
    }
  };

  function getUIString(langCode, key) {
    var lang = UI_STRINGS[langCode] || UI_STRINGS.en;
    return lang[key] != null ? lang[key] : UI_STRINGS.en[key];
  }

  function applyUIStrings(langCode) {
    var s = UI_STRINGS[langCode] || UI_STRINGS.en;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key || !s[key]) return;
      el.textContent = s[key];
      var titleKey = el.getAttribute("data-i18n-title");
      if (titleKey && s[titleKey]) el.setAttribute("title", s[titleKey]);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (key && s[key]) el.placeholder = s[key];
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (key && s[key]) el.setAttribute("title", s[key]);
    });
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        var ctx = new Ctx();
        if (ctx.resume) ctx.resume();
      }
      if (window.speechSynthesis) {
        var u = new window.SpeechSynthesisUtterance("");
        u.volume = 0;
        window.speechSynthesis.speak(u);
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }

  function api(path, options = {}) {
    const url = path.startsWith("/") ? path : "/" + path;
    return fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    }).then((r) => (r.ok ? r.json() : r.json().then((e) => Promise.reject(e))));
  }

  function getLang() {
    const opt = langSelect.options[langSelect.selectedIndex];
    return {
      code: opt.value,
      name: opt.dataset.name || opt.text,
    };
  }

  function refreshUploadList() {
    var listEl = document.getElementById("uploadedList");
    if (!listEl) return;
    var langCode = getLang().code;
    api("/api/uploads").then(function (data) {
      var files = data.files || [];
      if (files.length === 0) {
        listEl.innerHTML = "";
        listEl.style.display = "none";
        return;
      }
      listEl.style.display = "block";
      var attachedLabel = getUIString(langCode, "attachedLabel");
      var clearLabel = getUIString(langCode, "clearUploads");
      listEl.innerHTML = "<span class=\"uploaded-label\">" + attachedLabel + "</span> " +
        files.map(function (f) { return "<span class=\"uploaded-file\">" + (f.filename || f.type) + "</span>"; }).join(", ") +
        " <button type=\"button\" class=\"btn-clear-uploads\" id=\"clearUploadsBtn\">" + clearLabel + "</button>";
      var clearUploadsBtn = document.getElementById("clearUploadsBtn");
      if (clearUploadsBtn) clearUploadsBtn.addEventListener("click", clearUploads);
    });
  }

  function clearUploads() {
    api("/api/uploads/clear", { method: "POST" }).then(function () { refreshUploadList(); });
  }

  function ensureSession() {
    if (sessionId) return Promise.resolve();
    return api("/api/clear", { method: "POST" }).then(function () {
      return api("/api/session");
    }).then((data) => {
      sessionId = data.session_id;
      refreshUploadList();
      showWelcome();
    });
  }

  function showWelcome() {
    if (messagesEl.querySelector(".msg")) return;
    var langCode = getLang().code;
    var welcome = document.createElement("div");
    welcome.className = "welcome";
    welcome.innerHTML = "<h2>" + getUIString(langCode, "welcomeTitle") + " 👋</h2><p>" + getUIString(langCode, "welcomeBody") + "</p>";
    messagesEl.appendChild(welcome);
  }

  function removeWelcome() {
    const w = messagesEl.querySelector(".welcome");
    if (w) w.remove();
  }

  function appendMessage(role, content, isVoiceOutput, imageB64) {
    removeWelcome();
    const msg = document.createElement("div");
    msg.className = "msg " + role;
    var bubbleContent = role === "assistant" ? formatMessageContent(content) : escapeHtml(content).replace(/\n/g, "<br>");
    if (role === "assistant" && imageB64) {
      bubbleContent = '<img class="msg-generated-image" src="data:image/png;base64,' + imageB64 + '" alt="Generated image" />' + (bubbleContent ? "<p>" + bubbleContent + "</p>" : "");
    }
    msg.innerHTML = '<div class="msg-bubble">' + bubbleContent + "</div>";
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function formatMessageContent(text) {
    if (!text) return "";
    var parts = text.split("```");
    var html = "";
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        html += escapeHtml(parts[i]).replace(/\n/g, "<br>");
      } else {
        var block = parts[i];
        var firstLineEnd = block.indexOf("\n");
        var lang = firstLineEnd >= 0 ? block.slice(0, firstLineEnd).trim() : "";
        var code = firstLineEnd >= 0 ? block.slice(firstLineEnd + 1) : block;
        code = code.replace(/\n$/, "");
        html += '<pre class="code-block"><code class="language-' + escapeHtml(lang) + '">' +
          escapeHtml(code) + "</code></pre>";
      }
    }
    return html;
  }

  function showStopPlayback(show) {
    var btn = document.getElementById("stopPlaybackBtn");
    if (btn) btn.style.display = show ? "inline-flex" : "none";
  }

  function stopPlayback() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    showStopPlayback(false);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    var plain = (text || "").replace(/<[^>]+>/g, "").replace(/```[\s\S]*?```/g, "").trim();
    if (!plain) return;
    window.speechSynthesis.cancel();

    recognitionPausedForTTS = true;
    if (recognition && voiceBtn && voiceBtn.classList.contains("listening")) {
      try { recognition.stop(); } catch (e) {}
    }

    var langCode = langSelect.value === "en" ? "en-IN" : langSelect.value + "-IN";
    const u = new SpeechSynthesisUtterance(plain);
    u.rate = 0.95;
    u.onend = u.onerror = function () {
      showStopPlayback(false);
      recognitionPausedForTTS = false;
      if (voiceBtn && voiceBtn.classList.contains("listening") && recognition) {
        setTimeout(function () { try { recognition.start(); } catch (err) {} }, 500);
      }
    };

    function doSpeak() {
      var voices = window.speechSynthesis.getVoices();
      var preferred = voices.find(function (v) {
        return v.lang === langCode || v.lang.startsWith(langCode.split("-")[0]);
      });
      if (!preferred) {
        preferred = voices.find(function (v) { return v.lang.indexOf("-IN") !== -1; });
      }
      if (!preferred) {
        preferred = voices.find(function (v) { return v.lang.indexOf("en") === 0; });
      }
      if (preferred) {
        u.voice = preferred;
        u.lang = preferred.lang;
      } else {
        u.lang = langCode;
      }
      showStopPlayback(true);
      window.speechSynthesis.speak(u);
    }

    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = function () {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
    }
  }

  function showTypingIndicator() {
    var el = document.createElement("div");
    el.className = "msg assistant typing-indicator";
    el.setAttribute("data-typing", "1");
    el.innerHTML = '<div class="msg-bubble typing-dots"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function removeTypingIndicator() {
    var el = messagesEl.querySelector("[data-typing='1']");
    if (el) el.remove();
  }

  function sendMessage(message, isVoiceInput) {
    if (!message.trim()) return;
    const lang = getLang();
    sendBtn.disabled = true;
    removeWelcome();
    if (!isVoiceInput) appendMessage("user", message, false);
    var typingEl = showTypingIndicator();

    api("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: message.trim(),
        lang_code: lang.code,
        lang_name: lang.name,
        is_voice_input: isVoiceInput,
      }),
    })
      .then((data) => {
        removeTypingIndicator();
        var replyText = (data.reply || "").trim();
        appendMessage("assistant", replyText, false, data.image_b64 || null);
      })
      .catch((err) => {
        removeTypingIndicator();
        appendMessage(
          "assistant",
          "Sorry, something went wrong. " + (err.message || "Please try again."),
          false
        );
      })
      .finally(() => {
        sendBtn.disabled = false;
      });
  }

  function transliteratePreview() {
    const text = textInput.value.trim();
    if (!text || getLang().code === "en") return;
    clearTimeout(transliterateTimeout);
    transliterateTimeout = setTimeout(() => {
      api("/api/transliterate", {
        method: "POST",
        body: JSON.stringify({ text, lang_code: getLang().code }),
      })
        .then((data) => {
          const wrap = document.getElementById("transliteratePreview");
          if (!wrap) return;
          // Only show Roman transliteration preview; do not show Script (Indic) preview
          if (data.transliterated && data.transliterated !== text && data.direction === "to_roman") {
            wrap.textContent = "Roman: " + data.transliterated;
            wrap.style.display = "block";
          } else {
            wrap.style.display = "none";
          }
        })
        .catch(() => {});
    }, 400);
  }

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0 && window.innerWidth < 768);
    }

  function initVoice() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    var mobile = isMobileDevice();
    if (!SpeechRecognition) {
      voiceBtn.title = mobile
        ? "Voice not supported on this device. Use a laptop with Chrome/Edge, or type your message."
        : "Voice not supported in this browser. Use Chrome or Edge.";
      voiceBtn.disabled = true;
      if (mobile) voiceBtn.setAttribute("aria-label", "Voice not supported on mobile. Type your message below.");
      return;
    }
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      voiceBtn.title = mobile
        ? "Microphone not available on this device. Please type your message."
        : "Microphone not supported. Use HTTPS and a modern browser (Chrome, Edge).";
      voiceBtn.disabled = true;
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      voiceBtn.title = "Microphone requires HTTPS. Open this site via https://";
      voiceBtn.disabled = true;
      return;
    }
    recognition = new SpeechRecognition();
    recognition.continuous = mobile ? false : true;
    recognition.interimResults = false;
    recognition.lang = getLang().code === "en" ? "en-IN" : getLang().code + "-IN";

    var stopRequested = false;
    var micStream = null;

    function releaseMicStream() {
      if (micStream) {
        micStream.getTracks().forEach(function (t) { t.stop(); });
        micStream = null;
      }
    }

    voiceBtn.addEventListener("click", function () {
      unlockAudio();
      if (voiceBtn.classList.contains("listening")) {
        stopRequested = true;
        if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
        releaseMicStream();
        recognition.stop();
        return;
      }
      stopRequested = false;
      recognition.lang = getLang().code === "en" ? "en-IN" : getLang().code + "-IN";
      voiceBtn.classList.add("listening");
      voiceBtn.title = getUIString(getLang().code, "listeningTitle");

      var constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        micStream = stream;
        if (mobile) {
          setTimeout(function () { try { recognition.start(); } catch (e) {} }, 150);
        } else {
          recognition.start();
        }
      }).catch(function (err) {
        voiceBtn.classList.remove("listening");
        voiceBtn.title = getUIString(getLang().code, "voiceInput");
        var msg = "Microphone access denied or unavailable. ";
        if (err && err.name === "NotAllowedError") {
          msg += "Please allow the microphone when your browser prompts, or check your browser/site settings (e.g. allow for this site).";
        } else if (err && err.name === "NotFoundError") {
          msg += "No microphone found. Connect a microphone and try again.";
        } else {
          msg += "Use a modern browser (Chrome or Edge) and ensure the page is loaded over HTTPS.";
        }
        if (isMobileDevice()) {
          msg += " On Android: check Chrome → Site settings → Microphone and allow for this site. If it still fails, please type your message below.";
        }
        if (typeof alert !== "undefined") alert(msg);
      });
    });

    var silenceDelayMs = 2500;
    var silenceTimer = null;

    var assistantPhrasePattern = /^(how can I (help|assist)|would you like to know|could you (clarify|provide|tell)|it seems (you|to)|sorry,?|please (provide|clarify|tell)|thank you|thanks[!.]?\s*$|^okay\s*$|^ok\s*$|what would you like|is there anything else|let me know if)/i;
    recognition.onresult = function (e) {
      var last = e.results.length - 1;
      var transcript = (e.results[last][0].transcript || "").trim();
      var minLen = mobile ? 3 : 10;
      if (!e.results[last].isFinal || transcript.length < minLen) return;
      if (assistantPhrasePattern.test(transcript)) return;
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(function () {
        silenceTimer = null;
        sendMessage(transcript, true);
      }, silenceDelayMs);
    };

    recognition.onend = function () {
      if (recognitionPausedForTTS) return;
      if (stopRequested) {
        releaseMicStream();
        voiceBtn.classList.remove("listening");
        voiceBtn.title = getUIString(getLang().code, "voiceInput");
        stopRequested = false;
      } else {
        if (voiceBtn.classList.contains("listening")) {
          if (mobile) {
            setTimeout(function () { try { recognition.start(); } catch (err) {} }, 200);
          } else {
            try { recognition.start(); } catch (err) {}
          }
        }
      }
    };
    recognition.onerror = function (e) {
      if (stopRequested) return;
      releaseMicStream();
      voiceBtn.classList.remove("listening");
      voiceBtn.title = getUIString(getLang().code, "voiceInput");
      if (e && typeof alert !== "undefined") {
        if (e.error === "not-allowed") {
          alert("Microphone access was denied. Allow the microphone for this site (Chrome: ⋮ → Site settings → Microphone) and try again.");
        } else if (isMobileDevice()) {
          var androidHint = /Android/i.test(navigator.userAgent) ? " On Android Chrome: allow mic in site settings (⋮ → Site settings → Microphone). " : "";
          alert("Voice input didn't work." + androidHint + "You can type your message in the box below.");
        }
      }
    };
  }

  textInput.addEventListener("input", transliteratePreview);
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const t = textInput.value.trim();
      if (t) {
        sendMessage(t, false);
        textInput.value = "";
        var preview = document.getElementById("transliteratePreview");
        if (preview) preview.style.display = "none";
      }
    }
  });

  sendBtn.addEventListener("click", () => {
    const t = textInput.value.trim();
    if (t) {
      sendMessage(t, false);
      textInput.value = "";
      const preview = document.getElementById("transliteratePreview");
      if (preview) preview.style.display = "none";
    }
  });

  clearBtn.addEventListener("click", () => {
    api("/api/clear", { method: "POST" }).then(() => {
      sessionId = null;
      while (messagesEl.firstChild) messagesEl.firstChild.remove();
      showWelcome();
      refreshUploadList();
    });
  });

  var fileInput = document.getElementById("fileInput");
  var uploadBtn = document.getElementById("uploadBtn");
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () {
      var files = fileInput.files;
      if (!files || !files.length) return;
      var form = new FormData();
      for (var i = 0; i < files.length; i++) form.append("files", files[i]);
      fileInput.value = "";
      fetch("/api/upload", { method: "POST", body: form })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.files && data.files.length) refreshUploadList();
        })
        .catch(function () {});
    });
  }

  // Paste screenshot/image from clipboard (e.g. Ctrl+V after copying a screenshot)
  document.addEventListener("paste", function (e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image/") !== 0) continue;
      e.preventDefault();
      var blob = items[i].getAsFile();
      if (!blob) continue;
      var ext = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" || blob.type === "image/jpg" ? "jpeg" : blob.type === "image/gif" ? "gif" : "webp";
      var file = new File([blob], "pasted-screenshot." + ext, { type: blob.type });
      var form = new FormData();
      form.append("files", file);
      fetch("/api/upload", { method: "POST", body: form })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.files && data.files.length) refreshUploadList();
        })
        .catch(function () {});
      break;
    }
  });

  var stopPlaybackBtn = document.getElementById("stopPlaybackBtn");
  if (stopPlaybackBtn) stopPlaybackBtn.addEventListener("click", stopPlayback);

  applyUIStrings("en");
  langSelect.addEventListener("change", function () {
    var code = getLang().code;
    applyUIStrings(code);
    // Stop the mic so mic state and chat both reset when language changes
    if (recognition && voiceBtn.classList.contains("listening")) {
      voiceBtn.click();
    }
    api("/api/clear", { method: "POST" }).then(function () {
      sessionId = null;
      while (messagesEl.firstChild) messagesEl.firstChild.remove();
      showWelcome();
      refreshUploadList();
    });
  });

  ensureSession().then(() => {});
  initVoice();
  function updateMobileVoiceHint() {
    if (!isMobileDevice()) return;
    var mobileHint = document.getElementById("mobileVoiceHint");
    if (!mobileHint || !voiceBtn) return;
    if (voiceBtn.disabled) {
      mobileHint.textContent = getUIString(getLang().code, "mobileVoiceHint");
      mobileHint.style.display = "block";
    } else {
      mobileHint.style.display = "none";
    }
  }
  if (isMobileDevice()) updateMobileVoiceHint();

  // When language changes, refresh the mobile voice hint text
  if (langSelect) {
    langSelect.addEventListener("change", function () {
      setTimeout(updateMobileVoiceHint, 0);
    });
  }
})();
