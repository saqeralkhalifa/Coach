/* Arabian Method (formerly AI Coach), arabianmethod.com. Accounts, plans and check-ins live in Supabase.
   Until CONFIG.supabaseUrl is filled in, the page runs as a preview and saves nothing. */
(function(){
"use strict";

var CONFIG = {
  supabaseUrl: "https://rptntnofsuozxnmtzulk.supabase.co",          // e.g. https://abcdefgh.supabase.co
  supabaseKey: "sb_publishable_NqCGnIBcjy5WXwI77eKdFg_JvnwPT4o",          // publishable (anon) key from Settings > API
  intervalsClientId: "1650",    // from the Intervals.icu app page
  consentVersion: "2026-11-10",
  benefitPay: { name: "[NAME ON BENEFITPAY]", number: "[BENEFITPAY NUMBER OR IBAN]" },
  bank: { holder: "[ACCOUNT HOLDER]", bank: "[BANK NAME]", iban: "[IBAN]", swift: "[SWIFT CODE]" },
  fee: 20
};
var LIVE = /^https:\/\//.test(CONFIG.supabaseUrl) && CONFIG.supabaseKey.length > 20;
/* Repair links that arrive as #signin#access_token=... so the auth library can read the tokens. */
(function(){
  var h = location.hash, i = h.search(/(access_token|error|error_code)=/);
  if(i > 1){ var j = h.lastIndexOf("#", i); if(j > 0) history.replaceState(null, "", location.pathname + location.search + h.slice(j)); }
})();
var LINK_ERR = /error_code=otp_expired|error=access_denied/.test(location.hash);
var RECOVERY_TOKENS = (function(){
  var q = new URLSearchParams(location.hash.replace(/^#/, ""));
  return q.get("access_token") && q.get("refresh_token") ? { access_token:q.get("access_token"), refresh_token:q.get("refresh_token") } : null;
})();
var sb = LIVE && window.supabase ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey) : null;

/* ---------- language ---------- */
function initLang(){
  try{
    var q = (location.search.match(/[?&]lang=(ar|en)\b/) || [])[1]; if(q) return q;
    var s = localStorage.getItem("mc-lang"); if(s === "ar" || s === "en") return s;
    var n = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    if(/^ar/i.test(n)) return "ar";
  }catch(e){}
  return "en";
}
var LANG = initLang();

var DAYS = ["Sat","Sun","Mon","Tue","Wed","Thu","Fri"];
var T = {
en:{
  previewBar:"<b>Preview</b>This page is not yet connected to its database. The forms check what you enter, but nothing is saved or sent.",
  register:"Register", signin:"Sign in", signout:"Sign out", save:"Save",
  tabOverview:"Overview", tabWeek:"My week", tabCoach:"Coach", tabConnect:"Check-in and watch", tabProfile:"Profile", tabMembership:"Membership", tabAdmin:"Admin",
  regH:"Create your account", regLead:"You will receive an email to confirm your address before your account opens.",
  fName:"Full name", fEmail:"Email", fPass:"Password", fPassH:"At least 10 characters", fPass2:"Repeat password", fPass2H:"Must match", fPassNew:"New password",
  fCountry:"Country of residence", fYear:"Year of birth", fYearH:"Used to set recovery rules for athletes aged 50 and over",
  consentsH:"Consents", consentsHint:"Each box is required. You can withdraw any consent later from your profile, which pauses your plan.",
  cAge:"I am 18 years old or older.",
  cTerms:'I have read and accept the <a href="#terms" data-go="terms" target="_blank">terms and medical disclaimer</a>. I understand the coach does not give medical advice, and I will get clearance from a doctor before starting.',
  cHealth:'I give my explicit consent to the collection and processing of my health data (heart rate, sleep, workouts, and reports of pain, illness or symptoms) to write and adjust my training plans, as set out in the <a href="#privacy" data-go="privacy" target="_blank">privacy notice</a>.',
  cTransfer:"I consent to my data being stored and processed in the European Union (Germany and Ireland) and the United States, by the service providers named in the privacy notice, and exchanged with Intervals.icu if I connect it.",
  cAi:"I understand that my plans are proposed by an AI system, checked against fixed training rules and supervised by Dr. Saqer, and that I can ask for any plan to be reviewed by him.",
  regBtn:"Create account", regOk:"Check your email and open the confirmation link. Your account opens once your address is confirmed. Then sign in, complete your training profile and pay the first month.",
  eName:"Enter your full name.", eEmail:"Enter a valid email address.", ePass:"The password needs at least 10 characters.", ePass2:"The two passwords do not match.",
  eYear:"Enter your year of birth.", eAge:"Registration is open to adults aged 18 and over.", eConsent:"Every consent box is required to register.",
  eNet:"Something went wrong. Check your connection and try again.", ePreview:"This is a preview, so nothing was saved.",
  signinH:"Sign in to your account", forgot:"Forgot password", resetH:"Choose a new password",
  eSignin:"The email or password is not correct, or the email address has not been confirmed yet.",
  forgotSent:"If an account exists for that address, an email with a link to set a new password has been sent.", resetDone:"Your password has been changed.", eLinkOld:"This reset link has expired or was already used. Go back, choose Forgot password, and open the newest email in this same browser.", eSamePass:"Choose a password that is different from your old one.",
  connH:"Your daily check-in and your watch", connLead:"Send the check-in every morning. With Garmin connected through Intervals.icu, you do not need to upload anything.",
  ciH:"Today's check-in", ciNot:"Not sent", ciSent:"Sent", ciPausedBadge:"Plan paused",
  ciSleep:"Hours slept last night", ciRhr:"Resting heart rate this morning", ciFeel:"How you feel",
  ciPain:"I have pain or an injury", ciIll:"I feel unwell or have cold or flu symptoms", ciFever:"I have a fever",
  ciWarn:"I have had chest pain, fainting, dizziness, palpitations or unusual breathlessness",
  ciNote:"Anything else the coach should know", ciSend:"Send check-in",
  ciPaused:"Your plan is paused. Please see a doctor before training again. Dr. Saqer has been told and will contact you.",
  ciUrgent:"Stop training now. If you have chest pain, have fainted or feel very unwell, call 999 or go to the nearest emergency department. Dr. Saqer has been told.",
  eSleep:"Enter how many hours you slept.", eFeel:"Choose how you feel today.",
  gH:"Garmin through Intervals.icu", gNot:"Not connected", gOk:"Connected",
  gP:"Intervals.icu links to Garmin Connect. Sessions from your plan go to your watch, and finished workouts, sleep and resting heart rate come back.",
  g1:"Create a free account at intervals.icu.", g2:"In its settings, connect Garmin Connect and turn on upload of planned workouts.", g3:"Press the button below and approve access.",
  gBtn:"Connect Intervals.icu", gAgain:"Connect again",
  gDone:"Intervals.icu is connected.", gFail:"The connection did not complete. Please try again.",
  uH:"Upload workout files", uNone:"No files", uP:"For Coros, Suunto, Polar, Apple Watch or any other device. Export the file from your watch app and add it here.",
  uDrag:"Drag files here, or", uChoose:"Choose files", uOk:"Received", uBad:"Not a workout file", uErr:"Could not be read",
  planned:"Planned", notYet:"Not yet available", notSupported:"Not supported",
  tpP:"Partner access will be requested from TrainingPeaks. If it is approved, your sessions will also appear in your TrainingPeaks calendar.",
  stravaP:"Strava's API terms do not allow its data to be used by AI systems, so it cannot be connected. If your watch also syncs to Strava, connect the watch here directly.",
  clearH:"Restarting your plan", clearP:"Your plan was paused after a report of pain, illness or symptoms. Once a doctor has cleared you to train, confirm it below and Dr. Saqer will restart your plan.",
  clearCheck:"A doctor has examined me and cleared me to return to training.", clearBtn:"Send confirmation", clearOk:"Thank you. Dr. Saqer will review this and restart your plan.", eClear:"Tick the box to confirm.",
  profH:"Your race and your week", profLead:"The plan is built from these answers. You can change them at any time, and next week's plan adjusts.",
  pRace:"Target race", pDate:"Race date", pDist:"Distance", pYears:"Years of endurance training", pHours:"Hours you train now, per week",
  pDays:"Days you can train", pSwim:"Preferred swim days", pSwimH:"Choose the days you have pool or open water access",
  pLong:"Day for your long session", pTime:"Usual training time", pEquip:"Equipment you use",
  pHr:"Heart rate monitor (watch or chest strap)", pPower:"Power meter on the bike", pTrainer:"Indoor trainer",
  pInj:"Injuries or health conditions the coach should know about", pInjH:"Leave blank if none. This is kept for Dr. Saqer and is not sent to the AI system.",
  profOk:"Profile saved.", eDate:"Enter a race date in the future.", eDist:"Choose a race distance.", eDays:"Choose at least three days you can train.", eYears:"Choose your years of training.",
  rightsEyebrow:"Your data", rightsH:"Download, withdraw or delete", rightsLead:"These are your rights under the data protection law that applies to you, and you can use them here at any time.",
  dlH:"Download your data", dlP:"A file with everything held about you: profile, consents, check-ins, workouts, plans and payments.", dlBtn:"Download",
  consH:"Your consents", consP:"Withdrawing a consent pauses your plan, because the service cannot run without it.", withdraw:"Withdraw", withdrawn:"Withdrawn", given:"Given",
  kAge:"Age 18 or over", kTerms:"Terms", kMedical:"Medical disclaimer", kHealth:"Health data", kTransfer:"International data transfer", kAi:"AI processing", kEmail:"Email",
  confirmWithdraw:"Withdraw this consent? Your plan will pause.",
  delH:"Delete your account", delP:"Deletes your account and all your data, and disconnects Intervals.icu. Payment records are kept without health data, as the law requires.",
  delLabel:"Type DELETE to confirm", delBtn:"Delete account", eDel:"Type DELETE in capital letters to confirm.", delDone:"Your account has been deleted.",
  outH:"Sign out", outP:"Sign out of this browser.",
  memH:"Monthly membership", memLead:"The first 30 athletes who confirm their email get their first month free, starting with their first approved plan. After that, pay by BenefitPay or by bank transfer, then report the payment below.",
  memFee:"Monthly fee", memPrice:"US$20 a month, first month free for the first 30 athletes",
  memIncl:"Weekly plans, daily sessions sent to your watch, the daily check-in, and review of any flagged report by our head coach.",
  bpH:"BenefitPay", bpP:"Send US$20, or the equivalent, for each month by BenefitPay to:", bankMicro:"Bank transfer", bankH:"From any bank", bankP:"Send US$20 for each month, or the equivalent, by bank transfer. Bank charges are paid by the sender.",
  dName:"Name", dNumber:"BenefitPay", dHolder:"Account holder", dBank:"Bank", dIban:"IBAN", dSwift:"SWIFT", dRef:"Reference",
  reportMicro:"After paying", reportH:"Report your payment", payMethod:"Method", payMonths:"Months paid", payRef:"Payment reference",
  paySend:"Report payment", payOk:"Payment reported. You will see it confirmed here once it has been checked.", eRef:"Enter the payment reference from your receipt.",
  pReported:"Reported", pConfirmed:"Confirmed", pRejected:"Not found",
  memTerms:'Membership terms are in the <a href="#terms" data-go="terms">terms and medical disclaimer</a>. Fees already paid for a month that has started are not refunded.',
  stPending:"Your account is waiting for the first payment.", stTrialWait:"You have one of the 30 free months. It starts when your first plan is approved.", stTrial:function(d){return "Your free month runs until "+d+". To continue after that, pay below.";}, payLater:"Payment details will appear here before the free months end.", stActive:function(d){return "Your membership is active until "+d+".";}, stPaused:"Your plan is paused.", stClosed:"Your account is closed.",
  signedOutMem:"Register or sign in to pay and see your membership.",
  wkEyebrow:"My week", wkNone:"Your first plan is being prepared", wkNoneP:"Plans are written each Thursday evening for the week starting Saturday, and the first group's plans are approved by Dr. Saqer before they are sent. Complete your profile, connect your watch and send your daily check-in.",
  wkPending:"Your account is waiting for payment", wkPendingP:"Pay the first month on the Membership page. Your first plan follows once the payment is confirmed.",
  wkPaused:"Your plan is paused", wkPausedP:"Your plan was paused after a report of pain, illness or symptoms, a withdrawn consent, or a payment due. Dr. Saqer has been told.",
  wkH:function(i,ph){return "Week "+i+", "+ph+" phase";}, wkLead:function(r,d,w){return "Target race: "+r+", "+d+". "+w+" weeks to go.";},
  todayL:"Today", rest:"Rest day", min:"min", sentGarmin:"Sent to Intervals.icu and Garmin Connect. It appears on your watch after the next sync.", notSent:"It is sent to your watch early on the morning of the session.",
  easy:"Easy", moderate:"Moderate", hard:"Hard", zone:"zone", made_easier:"Made easier",
  chH:"Talk to your coach", chLead:"Ask about a session, tell your coach about travel or a busy day, or say how training feels. Your coach can move, shorten or change sessions within the safety rules, and changes go to your watch and calendar.",
  chAi:"Your coach is an AI. Dr. Saqer reviews anything flagged and can reply here himself. Report pain or illness here or in the daily check-in, and your plan will pause until a doctor clears you.",
  chLabel:"Your message", chSend:"Send", chEmpty:"Write a message first.", chYou:"You", chCoach:"Coach", chDr:"Dr. Saqer", chThinking:"Your coach is replying.", chHello:"Your conversation with your coach will appear here.",
  chMic:"Speak", chMicStop:"Stop", chMicHint:"Speak now. Check the words before you send them.", chMicNo:"Voice input is not available in this browser. Try Chrome or Safari, or type your message.", chListen:"Listen", chMicErr:"Voice input stopped. Check that the site may use your microphone, or type your message.",
  pHeatH:"Heat", pHeat:"I am new to hot weather, or just back from a cooler climate. Your coach takes extra care with heat for the next two weeks.",
  pRamH:"Ramadan", pRamHint:"Optional. If you fast in Ramadan, your coach plans sessions around iftar and suhoor during the month. This choice is used only for your training plan.",
  pRamCons:"I agree that my Ramadan setting, which may indicate my religion, is used only to plan my training. I can withdraw this consent on this page at any time.", eRamCons:"Please tick the consent for the Ramadan setting, or choose \"Not set\".", kReligion:"Ramadan setting",
  pRamStart:"First day of Ramadan for you (change it if your country starts on a different day)", pRamDays:"The days you plan to fast",
  condL:function(w, a){ return "Forecast heat (WBGT estimate) " + w + "°C" + (a ? ", " + a : ""); }, condA:{indoors:"moved indoors", easy:"made easy for the heat", shorter:"shortened for the heat", coolest_hour:"train at the coolest hour", watch:"warm, drink well"},
  dyH:"Plan around my calendar", dyP:"Paste the private address of your work or personal calendar and your coach will place sessions around your busy hours and travel. Only the start and end times of busy periods are kept, never titles, places, people or notes. You can disconnect at any time, which deletes them at once.",
  dyHowH:"Where to find your calendar's private address", dyHowG:"Google Calendar on a computer: Settings, choose the calendar on the left, then copy \"Secret address in iCal format\".", dyHowO:"Outlook.com or Microsoft 365: Settings, Calendar, Shared calendars, Publish a calendar, choose \"Can view when I'm busy\", Publish, then copy the ICS link.", dyHowA:"iCloud on a Mac or iPhone: open the calendar's settings, turn on Public Calendar, and copy the link.",
  dyLabel:"Calendar address (ends in .ics)", dyConnect:"Connect calendar", dyDisconnect:"Disconnect and delete busy times", dyBad:"Paste a calendar address from Google Calendar, Outlook or iCloud. It starts with https or webcal.",
  dyWaiting:"Connected. Your calendar will be read within the hour.", dyOk:function(n, at){ return "Connected. " + n + " busy period(s) in the next three weeks, last read " + at + "."; }, dyFail:function(m){ return "Your calendar could not be read: " + m; }, dyGone:"Disconnected. Your busy times have been deleted.",
  pNudgeH:"Messages from your coach", pNudge:"Let my coach message me first when it notices something useful, such as short sleep, a missed key session or a race coming up.",
  puH:"Notifications", puOff:"Turn on notifications to know when your coach replies or has something for you.", puOn:"Notifications are on for this device.", puIos:"On iPhone, first add Arabian Method to your Home Screen (Share, then Add to Home Screen), open it from there, and turn on notifications on this page.", puBtn:"Turn on notifications", puDenied:"Notifications are blocked for this site in your settings. You can allow them in your browser or phone settings.", puDone:"Notifications are on. You will hear from your coach on this device.",
  admChats:"Coach conversations", admReply:"Reply as Dr. Saqer", admWaiting:"waiting for a reply",
  calH:"Your sessions in your own calendar", calP:"Subscribe once and every session appears in your phone or computer calendar, with the time, the duration and what to do. When your coach changes the plan, your calendar changes too.",
  calApple:"Apple Calendar", calGoogle:"Google Calendar", calOutlook:"Outlook", calCopy:"Copy link", calCopied:"Link copied. Paste it into your calendar app as a subscribed calendar.",
  calNote:"Google Calendar refreshes subscribed calendars on its own schedule, so a change can take a few hours to show there. Keep this link private, because anyone who has it can see your sessions.",
  calReset:"Reset my calendar link", calResetQ:"Reset your calendar link? The old link will stop working, and you will need to subscribe again with the new one.", calResetDone:"Your calendar link has been reset. Subscribe again with one of the buttons above.",
  coachNoteH:"Coach's note for this week", chartH:"Planned training, last 8 weeks", chartNote:"The lighter bars are recovery weeks.",
  sPlanned:"Planned this week", sLow:"Time at low intensity", sSleep:"Average sleep, last 7 nights", sRhr:"Resting heart rate, 7 day average",
  recentH:"Recent workouts", garminAttr:"Garmin",
  phases:{base:"base",build:"build",peak:"peak",taper:"taper",race:"race",finish_safely:"finish safely"},
  admH:"Items that need you", admFlags:"Open flags", admPlans:"Plans awaiting approval", admPays:"Payments to confirm", admClear:"Clearance confirmations", admAth:"Athletes",
  approve:"Approve and send", reject:"Reject", confirm:"Confirm", notFound:"Not found", resolve:"Resolve", reactivate:"Restart plan", none:"Nothing here.",
  ruleNotes:"Rule checks", fixed:"fixed automatically", unresolved:"needs your decision",
  footer:'Arabian Method AI Coaching, <a href="https://arabianmethod.com/">arabianmethod.com</a>, <a href="#privacy" data-go="privacy">Privacy notice</a>, <a href="#terms" data-go="terms">Terms and medical disclaimer</a>',
  opts:{
    countries:[["Bahrain","Bahrain"],["Saudi Arabia","Saudi Arabia"],["United Arab Emirates","United Arab Emirates"],["Kuwait","Kuwait"],["Qatar","Qatar"],["Oman","Oman"],["Other","Other"]],
    feel:[["","Choose one"],["fresh","Fresh"],["normal","Normal"],["tired","Tired"],["very_tired","Very tired"]],
    dist:[["","Choose a distance"],["sprint","Triathlon, sprint"],["olympic","Triathlon, Olympic"],["70.3","Triathlon, half distance (70.3)"],["ironman","Triathlon, full distance (Ironman)"],["5k","Running, 5 km"],["10k","Running, 10 km"],["half_marathon","Running, half marathon"],["marathon","Running, marathon"]],
    years:[["","Choose one"],["lt1","Less than 1"],["1to2","1 to 2"],["3to5","3 to 5"],["gt5","More than 5"]],
    days:[["Fri","Friday"],["Sat","Saturday"],["Sun","Sunday"],["Mon","Monday"],["Tue","Tuesday"],["Wed","Wednesday"],["Thu","Thursday"]],
    time:[["early","Early morning"],["midday","Midday"],["evening","Evening"],["varies","It varies"]],
    paymethod:[["benefitpay","BenefitPay"],["bank_transfer","Bank transfer"]],
    ramadan:[["","Not set"],["not_fasting","I am not fasting"],["fasting","I am fasting"],["partly","I am fasting on some days"]],
    months:[["1","1 month"],["2","2 months"],["3","3 months"],["6","6 months"],["12","12 months"]],
    strength:[["none","No strength sessions"],["gym","Gym"],["home","At home, no equipment"]],
    summer:[["auto","Automatic, from the heat forecast"],["always","Always on"],["never","Never"]],
    racecond:[["","Not sure"],["hot","Hot"],["mild","Mild"],["cool","Cool"],["altitude","At altitude (above 1,500 m)"]],
    fitkind:[["run_test","Running 30 minute test"],["race","Race result"],["bike_power_test","Cycling 20 minute power test"],["bike_hr_test","Cycling 30 minute heart rate test"],["swim_css","Swim 400 m and 200 m test"]]
  },
  dayShort:{Sat:"Sat",Sun:"Sun",Mon:"Mon",Tue:"Tue",Wed:"Wed",Thu:"Thu",Fri:"Fri"}
},
ar:{
  previewBar:"<b>معاينة</b>هذه الصفحة غير متصلة بقاعدة بياناتها بعد. تتحقق النماذج مما تدخله، لكن لا يُحفظ شيء ولا يُرسل.",
  register:"التسجيل", signin:"تسجيل الدخول", signout:"تسجيل الخروج", save:"حفظ",
  tabOverview:"نظرة عامة", tabWeek:"أسبوعي", tabCoach:"المدرب", tabConnect:"التسجيل اليومي والساعة", tabProfile:"الملف", tabMembership:"الاشتراك", tabAdmin:"الإدارة",
  regH:"أنشئ حسابك", regLead:"ستصلك رسالة بالبريد الإلكتروني لتأكيد عنوانك قبل تفعيل حسابك.",
  fName:"الاسم الكامل", fEmail:"البريد الإلكتروني", fPass:"كلمة المرور", fPassH:"10 أحرف على الأقل", fPass2:"أعد كتابة كلمة المرور", fPass2H:"يجب أن تتطابق", fPassNew:"كلمة المرور الجديدة",
  fCountry:"بلد الإقامة", fYear:"سنة الميلاد", fYearH:"تُستخدم لتطبيق قواعد الاستشفاء الخاصة بمن أتموا 50 عاما",
  consentsH:"الموافقات", consentsHint:"كل خانة مطلوبة. ويمكنك سحب أي موافقة لاحقا من صفحة ملفك، وسيؤدي ذلك إلى إيقاف خطتك.",
  cAge:"أقر بأنني أتممت 18 عاما.",
  cTerms:'قرأت <a href="#terms" data-go="terms" target="_blank">الشروط وإخلاء المسؤولية الطبية</a> وأقبلها، وأدرك أن المدرب لا يقدم مشورة طبية، وسأحصل على إذن من طبيب قبل البدء.',
  cHealth:'أوافق صراحة على جمع بياناتي الصحية (نبض القلب والنوم والتمارين وبلاغات الألم أو المرض أو الأعراض) ومعالجتها لإعداد خططي التدريبية وتعديلها، على النحو المبين في <a href="#privacy" data-go="privacy" target="_blank">إشعار الخصوصية</a>.',
  cTransfer:"أوافق على حفظ بياناتي ومعالجتها في الاتحاد الأوروبي (ألمانيا وأيرلندا) والولايات المتحدة، لدى مزودي الخدمات المذكورين في إشعار الخصوصية، وعلى تبادلها مع Intervals.icu إذا ربطته.",
  cAi:"أدرك أن خططي يقترحها نظام ذكاء اصطناعي، ويُتحقق منها وفق قواعد تدريب ثابتة، تحت إشراف د. صقر، وأن لي أن أطلب منه مراجعة أي خطة.",
  regBtn:"إنشاء الحساب", regOk:"افتح بريدك الإلكتروني واضغط رابط التأكيد. يُفعّل حسابك بعد تأكيد عنوانك، ثم سجّل الدخول وأكمل ملف تدريبك وادفع رسوم الشهر الأول.",
  eName:"اكتب اسمك الكامل.", eEmail:"اكتب بريدا إلكترونيا صحيحا.", ePass:"يجب ألا تقل كلمة المرور عن 10 أحرف.", ePass2:"كلمتا المرور غير متطابقتين.",
  eYear:"اكتب سنة ميلادك.", eAge:"التسجيل متاح للبالغين الذين أتموا 18 عاما.", eConsent:"جميع خانات الموافقة مطلوبة للتسجيل.",
  eNet:"حدث خطأ. تحقق من اتصالك وحاول مرة أخرى.", ePreview:"هذه معاينة، لذلك لم يُحفظ شيء.",
  signinH:"سجّل الدخول إلى حسابك", forgot:"نسيت كلمة المرور", resetH:"اختر كلمة مرور جديدة",
  eSignin:"البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يُؤكد البريد الإلكتروني بعد.",
  forgotSent:"إذا كان هناك حساب بهذا العنوان، فقد أُرسل إليه بريد يتضمن رابطا لتعيين كلمة مرور جديدة.", resetDone:"تم تغيير كلمة المرور.", eLinkOld:"انتهت صلاحية رابط إعادة التعيين أو استُخدم من قبل. ارجع واختر نسيت كلمة المرور، ثم افتح أحدث رسالة في المتصفح نفسه.", eSamePass:"اختر كلمة مرور مختلفة عن كلمة المرور القديمة.",
  connH:"تسجيلك اليومي وساعتك", connLead:"أرسل التسجيل اليومي كل صباح. وإذا ربطت Garmin عبر Intervals.icu فلن تحتاج إلى رفع أي ملف.",
  ciH:"تسجيل اليوم", ciNot:"لم يُرسل", ciSent:"أُرسل", ciPausedBadge:"الخطة متوقفة",
  ciSleep:"عدد ساعات النوم الليلة الماضية", ciRhr:"نبض الراحة هذا الصباح", ciFeel:"كيف تشعر",
  ciPain:"أشعر بألم أو لدي إصابة", ciIll:"أشعر بتوعك أو لدي أعراض زكام أو إنفلونزا", ciFever:"لدي حمى",
  ciWarn:"شعرت بألم في الصدر أو إغماء أو دوار أو خفقان أو ضيق غير معتاد في التنفس",
  ciNote:"أي أمر آخر ينبغي أن يعرفه المدرب", ciSend:"إرسال التسجيل",
  ciPaused:"توقفت خطتك. يُرجى مراجعة طبيب قبل العودة إلى التدريب. أُبلغ د. صقر وسيتواصل معك.",
  ciUrgent:"توقف عن التدريب الآن. إذا كنت تشعر بألم في الصدر أو أصابك إغماء أو تشعر بتوعك شديد، فاتصل بالرقم 999 أو توجه إلى أقرب قسم طوارئ. أُبلغ د. صقر.",
  eSleep:"اكتب عدد ساعات نومك.", eFeel:"اختر كيف تشعر اليوم.",
  gH:"Garmin عبر Intervals.icu", gNot:"غير مرتبط", gOk:"مرتبط",
  gP:"يرتبط Intervals.icu بخدمة Garmin Connect، فتصل حصص خطتك إلى ساعتك وتعود التمارين المكتملة وبيانات النوم ونبض الراحة.",
  g1:"أنشئ حسابا مجانيا على intervals.icu.", g2:"في إعداداته، اربط Garmin Connect وفعّل رفع التمارين المخططة.", g3:"اضغط الزر أدناه ووافق على منح الوصول.",
  gBtn:"ربط Intervals.icu", gAgain:"الربط من جديد",
  gDone:"تم ربط Intervals.icu.", gFail:"لم يكتمل الربط. يُرجى المحاولة مرة أخرى.",
  uH:"رفع ملفات التمارين", uNone:"لا توجد ملفات", uP:"لساعات Coros وSuunto وPolar وApple Watch وغيرها. صدّر الملف من تطبيق ساعتك وأضفه هنا.",
  uDrag:"اسحب الملفات إلى هنا، أو", uChoose:"اختر الملفات", uOk:"استُلم", uBad:"ليس ملف تمرين", uErr:"تعذرت قراءته",
  planned:"مخطط له", notYet:"غير متاح بعد", notSupported:"غير مدعوم",
  tpP:"سيُطلب الوصول بصفة شريك من TrainingPeaks، وإذا وافقت عليه ستظهر حصصك في تقويمك على TrainingPeaks أيضا.",
  stravaP:"لا تسمح شروط الواجهة البرمجية لخدمة Strava باستخدام بياناتها في أنظمة الذكاء الاصطناعي، لذلك لا يمكن ربطها. وإذا كانت ساعتك تتزامن مع Strava أيضا، فاربط الساعة هنا مباشرة.",
  clearH:"استئناف خطتك", clearP:"توقفت خطتك بعد بلاغ عن ألم أو مرض أو أعراض. بعد أن يأذن لك طبيب بالتدريب، أكد ذلك أدناه وسيستأنف د. صقر خطتك.",
  clearCheck:"فحصني طبيب وأذن لي بالعودة إلى التدريب.", clearBtn:"إرسال التأكيد", clearOk:"شكرا لك. سيراجع د. صقر التأكيد ويستأنف خطتك.", eClear:"ضع علامة في الخانة للتأكيد.",
  profH:"سباقك وأسبوعك", profLead:"تُبنى الخطة على هذه الإجابات، ويمكنك تعديلها في أي وقت فتتكيف خطة الأسبوع التالي.",
  pRace:"السباق المستهدف", pDate:"تاريخ السباق", pDist:"المسافة", pYears:"سنوات التدريب على رياضات التحمل", pHours:"ساعات تدريبك الحالية أسبوعيا",
  pDays:"الأيام التي تستطيع التدرب فيها", pSwim:"أيام السباحة المفضلة", pSwimH:"اختر الأيام التي يتاح لك فيها مسبح أو مياه مفتوحة",
  pLong:"يوم الحصة الطويلة", pTime:"وقت التدريب المعتاد", pEquip:"المعدات التي تستخدمها",
  pHr:"جهاز قياس نبض القلب (ساعة أو حزام صدر)", pPower:"مقياس القدرة على الدراجة", pTrainer:"جهاز تدريب منزلي للدراجة",
  pInj:"الإصابات أو الحالات الصحية التي ينبغي أن يعرفها المدرب", pInjH:"اتركها فارغة إن لم يكن هناك شيء. تُحفظ لاطلاع د. صقر ولا تُرسل إلى نظام الذكاء الاصطناعي.",
  profOk:"حُفظ الملف.", eDate:"اكتب تاريخا قادما للسباق.", eDist:"اختر مسافة السباق.", eDays:"اختر ثلاثة أيام على الأقل للتدريب.", eYears:"اختر سنوات تدريبك.",
  rightsEyebrow:"بياناتك", rightsH:"التنزيل أو سحب الموافقة أو الحذف", rightsLead:"هذه حقوقك بموجب قانون حماية البيانات الذي ينطبق عليك، ويمكنك ممارستها هنا في أي وقت.",
  dlH:"تنزيل بياناتك", dlP:"ملف يتضمن كل ما يُحفظ عنك: الملف والموافقات والتسجيلات اليومية والتمارين والخطط والمدفوعات.", dlBtn:"تنزيل",
  consH:"موافقاتك", consP:"يؤدي سحب أي موافقة إلى إيقاف خطتك، لأن الخدمة لا تعمل بدونها.", withdraw:"سحب", withdrawn:"مسحوبة", given:"ممنوحة",
  kAge:"إتمام 18 عاما", kTerms:"الشروط", kMedical:"إخلاء المسؤولية الطبية", kHealth:"البيانات الصحية", kTransfer:"نقل البيانات دوليا", kAi:"المعالجة بالذكاء الاصطناعي", kEmail:"البريد الإلكتروني",
  confirmWithdraw:"هل تريد سحب هذه الموافقة؟ ستتوقف خطتك.",
  delH:"حذف حسابك", delP:"يحذف حسابك وجميع بياناتك ويلغي ربط Intervals.icu. وتُحفظ سجلات المدفوعات دون بيانات صحية، وفقا لما يقتضيه القانون.",
  delLabel:"اكتب DELETE للتأكيد", delBtn:"حذف الحساب", eDel:"اكتب DELETE بالأحرف الإنجليزية الكبيرة للتأكيد.", delDone:"حُذف حسابك.",
  outH:"تسجيل الخروج", outP:"تسجيل الخروج من هذا المتصفح.",
  memH:"الاشتراك الشهري", memLead:"يحصل أول 30 رياضيا يؤكدون بريدهم الإلكتروني على الشهر الأول مجانا، ويبدأ مع أول خطة معتمدة لهم. وبعد ذلك ادفع عبر BenefitPay أو بالتحويل البنكي، ثم أبلغ عن الدفعة أدناه.",
  memFee:"الرسوم الشهرية", memPrice:"20 دولارا أمريكيا شهريا، والشهر الأول مجاني لأول 30 رياضيا",
  memIncl:"خطط أسبوعية، وحصص يومية تُرسل إلى ساعتك، والتسجيل اليومي، ومراجعة مدربنا الرئيسي لأي بلاغ يُرفع إليه.",
  bpH:"BenefitPay", bpP:"أرسل 20 دولارا أو ما يعادلها عن كل شهر عبر BenefitPay إلى:", bankMicro:"التحويل البنكي", bankH:"من أي بنك", bankP:"أرسل 20 دولارا عن كل شهر أو ما يعادلها بالتحويل البنكي، ويتحمل المرسل الرسوم البنكية.",
  dName:"الاسم", dNumber:"BenefitPay", dHolder:"صاحب الحساب", dBank:"البنك", dIban:"IBAN", dSwift:"SWIFT", dRef:"المرجع",
  reportMicro:"بعد الدفع", reportH:"أبلغ عن دفعتك", payMethod:"طريقة الدفع", payMonths:"عدد الأشهر المدفوعة", payRef:"الرقم المرجعي للدفعة",
  paySend:"إبلاغ عن الدفعة", payOk:"تم الإبلاغ عن الدفعة، وسترى تأكيدها هنا بعد التحقق منها.", eRef:"اكتب الرقم المرجعي من إيصال الدفع.",
  pReported:"مُبلغ عنها", pConfirmed:"مؤكدة", pRejected:"لم يُعثر عليها",
  memTerms:'شروط الاشتراك واردة في <a href="#terms" data-go="terms">الشروط وإخلاء المسؤولية الطبية</a>. ولا تُرد الرسوم المدفوعة عن شهر بدأ.',
  stPending:"حسابك بانتظار الدفعة الأولى.", stTrialWait:"لك أحد الأشهر المجانية الثلاثين، ويبدأ عند اعتماد أول خطة لك.", stTrial:function(d){return "شهرك المجاني ساري حتى "+d+". وللاستمرار بعده ادفع أدناه.";}, payLater:"ستظهر بيانات الدفع هنا قبل انتهاء الأشهر المجانية.", stActive:function(d){return "اشتراكك ساري حتى "+d+".";}, stPaused:"خطتك متوقفة.", stClosed:"حسابك مغلق.",
  signedOutMem:"سجّل أو سجّل الدخول لتدفع وترى اشتراكك.",
  wkEyebrow:"أسبوعي", wkNone:"يجري إعداد خطتك الأولى", wkNoneP:"تُكتب الخطط مساء كل خميس للأسبوع الذي يبدأ يوم السبت، ويعتمد د. صقر خطط المجموعة الأولى قبل إرسالها. أكمل ملفك واربط ساعتك وأرسل تسجيلك اليومي.",
  wkPending:"حسابك بانتظار الدفع", wkPendingP:"ادفع رسوم الشهر الأول من صفحة الاشتراك، وتصلك خطتك الأولى بعد تأكيد الدفعة.",
  wkPaused:"خطتك متوقفة", wkPausedP:"توقفت خطتك بعد بلاغ عن ألم أو مرض أو أعراض، أو سحب موافقة، أو استحقاق دفعة. وقد أُبلغ د. صقر.",
  wkH:function(i,ph){return "الأسبوع "+i+"، مرحلة "+ph;}, wkLead:function(r,d,w){return "السباق المستهدف: "+r+"، "+d+". متبقٍ "+w+" أسبوعا.";},
  todayL:"اليوم", rest:"يوم راحة", min:"دقيقة", sentGarmin:"أُرسلت إلى Intervals.icu وGarmin Connect، وتظهر على ساعتك بعد المزامنة التالية.", notSent:"تُرسل إلى ساعتك في الصباح الباكر من يوم الحصة.",
  easy:"سهلة", moderate:"متوسطة", hard:"شاقة", zone:"منطقة", made_easier:"خُففت",
  chH:"تحدث مع مدربك", chLead:"اسأل عن حصة، أو أخبر مدربك عن سفر أو يوم مزدحم، أو صف كيف تشعر في تدريبك. يستطيع مدربك نقل الحصص أو تقصيرها أو تغييرها ضمن قواعد السلامة، وتصل التغييرات إلى ساعتك وتقويمك.",
  chAi:"مدربك نظام ذكاء اصطناعي. يراجع د. صقر أي حالة يُبلَّغ عنها ويستطيع الرد هنا بنفسه. أبلغ عن أي ألم أو مرض هنا أو في التسجيل اليومي، وستتوقف خطتك مؤقتا حتى يأذن لك الطبيب.",
  chLabel:"رسالتك", chSend:"إرسال", chEmpty:"اكتب رسالة أولا.", chYou:"أنت", chCoach:"المدرب", chDr:"د. صقر", chThinking:"مدربك يكتب الرد.", chHello:"ستظهر هنا محادثتك مع مدربك.",
  chMic:"تحدث", chMicStop:"إيقاف", chMicHint:"تحدث الآن، وراجع الكلمات قبل الإرسال.", chMicNo:"الإدخال الصوتي غير متاح في هذا المتصفح. جرّب Chrome أو Safari، أو اكتب رسالتك.", chListen:"استمع", chMicErr:"توقف الإدخال الصوتي. تأكد من السماح للموقع باستخدام الميكروفون، أو اكتب رسالتك.",
  pHeatH:"الحرارة", pHeat:"أنا جديد على الطقس الحار، أو عدت للتو من مناخ أبرد. سيأخذ مدربك الحرارة بحذر إضافي خلال الأسبوعين القادمين.",
  pRamH:"رمضان", pRamHint:"اختياري. إذا كنت تصوم رمضان فسيخطط مدربك حصصك حول الإفطار والسحور خلال الشهر. ويُستخدم هذا الاختيار لخطتك التدريبية فقط.",
  pRamCons:"أوافق على استخدام إعداد رمضان، الذي قد يدل على ديانتي، لتخطيط تدريبي فقط، ويمكنني سحب هذه الموافقة من هذه الصفحة في أي وقت.", eRamCons:"يرجى تأكيد الموافقة على إعداد رمضان، أو اختيار \"غير محدد\".", kReligion:"إعداد رمضان",
  pRamStart:"أول أيام رمضان بالنسبة لك (غيّره إذا بدأ في بلدك في يوم مختلف)", pRamDays:"الأيام التي تنوي صيامها",
  condL:function(w, a){ return "الحرارة المتوقعة (تقدير WBGT) " + w + "°م" + (a ? "، " + a : ""); }, condA:{indoors:"نُقلت إلى الداخل", easy:"خُففت بسبب الحرارة", shorter:"قُصّرت بسبب الحرارة", coolest_hour:"تدرّب في أبرد وقت", watch:"جو دافئ، اشرب جيدا"},
  dyH:"التخطيط حول تقويمي", dyP:"الصق العنوان الخاص لتقويم عملك أو تقويمك الشخصي، وسيضع مدربك الحصص حول ساعات انشغالك وسفرك. لا يُحفظ إلا وقت بداية ونهاية فترات الانشغال، ولا تُحفظ العناوين أو الأماكن أو الأشخاص أو الملاحظات. ويمكنك قطع الربط في أي وقت، فتُحذف فورا.",
  dyHowH:"أين تجد العنوان الخاص لتقويمك", dyHowG:"تقويم Google على الحاسوب: الإعدادات، اختر التقويم من القائمة، ثم انسخ \"العنوان السري بتنسيق iCal\".", dyHowO:"Outlook.com أو Microsoft 365: الإعدادات، التقويم، التقاويم المشتركة، نشر تقويم، اختر \"يمكن العرض عندما أكون مشغولا\"، نشر، ثم انسخ رابط ICS.", dyHowA:"iCloud على Mac أو iPhone: افتح إعدادات التقويم، فعّل التقويم العام، وانسخ الرابط.",
  dyLabel:"عنوان التقويم (ينتهي بـ .ics)", dyConnect:"ربط التقويم", dyDisconnect:"قطع الربط وحذف أوقات الانشغال", dyBad:"الصق عنوان تقويم من Google أو Outlook أو iCloud، يبدأ بـ https أو webcal.",
  dyWaiting:"تم الربط. ستُقرأ بيانات تقويمك خلال ساعة.", dyOk:function(n, at){ return "تم الربط. " + n + " فترة انشغال خلال الأسابيع الثلاثة القادمة، وآخر قراءة في " + at + "."; }, dyFail:function(m){ return "تعذرت قراءة تقويمك: " + m; }, dyGone:"تم قطع الربط وحُذفت أوقات انشغالك.",
  pNudgeH:"رسائل من مدربك", pNudge:"اسمح لمدربي بمراسلتي أولا عندما يلاحظ أمرا مفيدا، مثل قلة النوم أو تفويت حصة أساسية أو اقتراب السباق.",
  puH:"الإشعارات", puOff:"فعّل الإشعارات لتعرف متى يرد مدربك أو متى لديه ما يخبرك به.", puOn:"الإشعارات مفعلة على هذا الجهاز.", puIos:"على iPhone، أضف المنهج العربي أولا إلى الشاشة الرئيسية (مشاركة، ثم إضافة إلى الشاشة الرئيسية)، وافتحه من هناك، ثم فعّل الإشعارات من هذه الصفحة.", puBtn:"تفعيل الإشعارات", puDenied:"الإشعارات محظورة لهذا الموقع في إعداداتك. يمكنك السماح بها من إعدادات المتصفح أو الهاتف.", puDone:"تم تفعيل الإشعارات. ستصلك رسائل مدربك على هذا الجهاز.",
  admChats:"محادثات المدرب", admReply:"الرد باسم د. صقر", admWaiting:"بانتظار الرد",
  calH:"حصصك في تقويمك الخاص", calP:"اشترك مرة واحدة وستظهر كل حصة في تقويم هاتفك أو حاسوبك، مع الوقت والمدة وما عليك فعله. وعندما يغيّر مدربك الخطة يتغير تقويمك أيضا.",
  calApple:"تقويم Apple", calGoogle:"تقويم Google", calOutlook:"Outlook", calCopy:"نسخ الرابط", calCopied:"تم نسخ الرابط. الصقه في تطبيق التقويم كتقويم مشترك.",
  calNote:"يحدّث تقويم Google التقاويم المشتركة وفق جدوله الخاص، لذلك قد يستغرق ظهور التغيير فيه بضع ساعات. احتفظ بهذا الرابط لنفسك، لأن أي شخص يملكه يستطيع رؤية حصصك.",
  calReset:"إعادة تعيين رابط التقويم", calResetQ:"هل تريد إعادة تعيين رابط التقويم؟ سيتوقف الرابط القديم عن العمل، وستحتاج إلى الاشتراك من جديد بالرابط الجديد.", calResetDone:"تمت إعادة تعيين رابط التقويم. اشترك من جديد بأحد الأزرار أعلاه.",
  coachNoteH:"ملاحظة المدرب لهذا الأسبوع", chartH:"التدريب المخطط خلال آخر 8 أسابيع", chartNote:"الأعمدة الفاتحة أسابيع استشفاء.",
  sPlanned:"المخطط لهذا الأسبوع", sLow:"الوقت بشدة منخفضة", sSleep:"متوسط النوم، آخر 7 ليال", sRhr:"نبض الراحة، متوسط 7 أيام",
  recentH:"آخر التمارين", garminAttr:"Garmin",
  phases:{base:"الأساس",build:"البناء",peak:"الذروة",taper:"التخفيف",race:"السباق",finish_safely:"الإنهاء الآمن"},
  admH:"ما يحتاج إليك", admFlags:"البلاغات المفتوحة", admPlans:"خطط بانتظار الاعتماد", admPays:"مدفوعات بانتظار التأكيد", admClear:"تأكيدات الإذن الطبي", admAth:"الرياضيون",
  approve:"اعتماد وإرسال", reject:"رفض", confirm:"تأكيد", notFound:"لم يُعثر عليها", resolve:"إغلاق", reactivate:"استئناف الخطة", none:"لا شيء هنا.",
  ruleNotes:"فحوص القواعد", fixed:"صُححت آليا", unresolved:"تحتاج إلى قرارك",
  footer:'المنهج العربي للتدريب بالذكاء الاصطناعي، <a href="https://arabianmethod.com/">arabianmethod.com</a>، <a href="#privacy" data-go="privacy">إشعار الخصوصية</a>، <a href="#terms" data-go="terms">الشروط وإخلاء المسؤولية الطبية</a>',
  opts:{
    countries:[["Bahrain","البحرين"],["Saudi Arabia","السعودية"],["United Arab Emirates","الإمارات"],["Kuwait","الكويت"],["Qatar","قطر"],["Oman","عُمان"],["Other","بلد آخر"]],
    feel:[["","اختر"],["fresh","نشيط"],["normal","طبيعي"],["tired","متعب"],["very_tired","متعب جدا"]],
    dist:[["","اختر المسافة"],["sprint","ترايثلون، سبرنت"],["olympic","ترايثلون، أولمبي"],["70.3","ترايثلون، نصف المسافة (70.3)"],["ironman","ترايثلون، المسافة الكاملة (آيرونمان)"],["5k","جري، 5 كم"],["10k","جري، 10 كم"],["half_marathon","جري، نصف ماراثون"],["marathon","جري، ماراثون"]],
    years:[["","اختر"],["lt1","أقل من سنة"],["1to2","من سنة إلى سنتين"],["3to5","من 3 إلى 5 سنوات"],["gt5","أكثر من 5 سنوات"]],
    days:[["Fri","الجمعة"],["Sat","السبت"],["Sun","الأحد"],["Mon","الاثنين"],["Tue","الثلاثاء"],["Wed","الأربعاء"],["Thu","الخميس"]],
    time:[["early","الصباح الباكر"],["midday","منتصف النهار"],["evening","المساء"],["varies","يختلف"]],
    paymethod:[["benefitpay","BenefitPay"],["bank_transfer","تحويل بنكي"]],
    ramadan:[["","غير محدد"],["not_fasting","لن أصوم"],["fasting","سأصوم"],["partly","سأصوم بعض الأيام"]],
    months:[["1","شهر واحد"],["2","شهران"],["3","3 أشهر"],["6","6 أشهر"],["12","12 شهرا"]],
    strength:[["none","بدون تمارين قوة"],["gym","في النادي الرياضي"],["home","في المنزل بدون معدات"]],
    summer:[["auto","تلقائي حسب توقعات الحرارة"],["always","مفعل دائما"],["never","غير مفعل"]],
    racecond:[["","غير متأكد"],["hot","حار"],["mild","معتدل"],["cool","بارد"],["altitude","على ارتفاع (أكثر من 1500 م)"]],
    fitkind:[["run_test","اختبار الجري 30 دقيقة"],["race","نتيجة سباق"],["bike_power_test","اختبار القدرة على الدراجة 20 دقيقة"],["bike_hr_test","اختبار النبض على الدراجة 30 دقيقة"],["swim_css","اختبار السباحة 400 م و200 م"]]
  },
  dayShort:{Sat:"السبت",Sun:"الأحد",Mon:"الاثنين",Tue:"الثلاثاء",Wed:"الأربعاء",Thu:"الخميس",Fri:"الجمعة"}
}};
function t(k){ var v = T[LANG][k]; return v === undefined ? T.en[k] : v; }

/* ---------- helpers ---------- */
function $(id){ return document.getElementById(id); }
function el(tag, attrs, kids){
  var e = document.createElement(tag);
  for(var k in (attrs || {})){ if(k === "text") e.textContent = attrs[k]; else if(k === "cls") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
  (kids || []).forEach(function(c){ if(c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}
function err(id, msg){ var e = $(id); if(!e) return; e.textContent = msg || ""; e.classList.toggle("on", !!msg); }
function ok(id, on){ var e = $(id); if(e) e.classList.toggle("on", on !== false); }
function banner(msg, bad){ var b = $("banner"); b.textContent = msg || ""; b.classList.toggle("on", !!msg); b.classList.toggle("alert", !!bad); }
function iso(d){ return d.toISOString().slice(0,10); }
function todayStr(){ return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Bahrain",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()); }
function addDays(s, n){ var d = new Date(s + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
function weekStartOf(s){ var day = new Date(s + "T00:00:00Z").getUTCDay(); return addDays(s, -((day + 1) % 7)); }
function dowKey(s){ return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(s + "T00:00:00Z").getUTCDay()]; }
function fmtDate(s){ try{ return new Intl.DateTimeFormat(LANG === "ar" ? "ar-BH-u-nu-latn" : "en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(s + "T00:00:00Z")); }catch(e){ return s; } }
function hm(min){
  var h = Math.floor(min/60), m = Math.round(min%60), mm = (m < 10 ? "0" : "") + m;
  if(LANG === "ar") return h ? (h + " س " + mm + " د") : (m + " دقيقة");
  return h ? (h + " h " + mm) : (m + " " + t("min"));
}
function sep(){ return LANG === "ar" ? "، " : ", "; }

/* ---------- i18n ---------- */
function applyI18n(){
  document.documentElement.lang = LANG; document.documentElement.dir = "ltr"; // the header keeps its own layout; main switches to rtl in CSS
  document.querySelectorAll("[data-t]").forEach(function(n){ var v = t(n.dataset.t); if(typeof v === "string") n.textContent = v; });
  document.querySelectorAll("[data-th]").forEach(function(n){ var v = t(n.dataset.th); if(typeof v === "string") n.innerHTML = v; });
  document.querySelectorAll("select[data-opts]").forEach(function(s){
    var cur = s.value, list = t("opts")[s.dataset.opts]; s.innerHTML = "";
    list.forEach(function(o){ s.appendChild(el("option", {value:o[0], text:o[1]})); });
    if(cur) s.value = cur;
  });
  ["p-days","p-swim","p-ram-days"].forEach(function(id){
    var box = $(id), checked = Array.prototype.map.call(box.querySelectorAll("input:checked"), function(i){ return i.value; });
    if(!box.children.length) checked = id === "p-days" ? ["Sat","Sun","Mon","Wed","Thu","Fri"] : id === "p-swim" ? ["Sun","Wed"] : [];
    box.innerHTML = "";
    DAYS.forEach(function(d){ var inp = el("input",{type:"checkbox",value:d}); inp.checked = checked.indexOf(d) > -1; box.appendChild(el("label",{cls:"day"},[inp, el("span",{text:t("dayShort")[d]})])); });
  });
  document.title = LANG === "ar" ? "المنهج العربي: تدريب ذكي للجري والترايثلون" : "Arabian Method: AI coaching for running and triathlon";
  if(STATE.view) render(STATE.view);
}
var lt = $("langToggle");
function flipLang(){ LANG = LANG === "ar" ? "en" : "ar"; try{ localStorage.setItem("mc-lang", LANG); }catch(e){} applyI18n(); }
if(lt) lt.addEventListener("click", flipLang);
if($("langToggle2")) $("langToggle2").addEventListener("click", flipLang);

/* ---------- state and routing ---------- */
var STATE = { view:null, user:null, profile:null, admin:false };
var VIEWS = ["overview","register","signin","week","raceplan","coach","connect","profile","membership","sponsor","admin","privacy","terms"];
var NEEDS_IN = {week:1, raceplan:1, coach:1, connect:1, profile:1, admin:1};

function setTabs(){
  var signed = !!STATE.user || !sb; // the preview shows every athlete page
  document.querySelectorAll("#tabs a").forEach(function(a){
    var w = a.dataset.when; a.hidden = (w === "out" && !!STATE.user) || (w === "in" && !signed) || (w === "admin" && !STATE.admin);
  });
  $("heroCta").hidden = !!STATE.user;
  ["navCta","memCta"].forEach(function(id){ var x = $(id); if(x) x.hidden = !!STATE.user; });
}
function go(v, push){
  var hash = v.split("?")[0];
  if(VIEWS.indexOf(hash) < 0) hash = "overview";
  if(NEEDS_IN[hash] && !STATE.user && LIVE) hash = "signin";
  STATE.view = hash;
  VIEWS.forEach(function(x){ $("v-" + x).classList.toggle("on", x === hash); });
  document.querySelectorAll("#tabs a").forEach(function(a){ if(a.dataset.go === hash){ a.setAttribute("aria-current","page"); try{ a.scrollIntoView({ inline:"center", block:"nearest" }); }catch(e){} } else a.removeAttribute("aria-current"); });
  if(window.__tabsMore) window.__tabsMore();
  if(push !== false){ try{ history.replaceState(null, "", "#" + hash); }catch(e){} }
  render(hash);
}
document.addEventListener("click", function(e){
  var sc = e.target.closest("[data-scroll]");
  if(sc){ e.preventDefault(); var tg = $(sc.dataset.scroll), nav = $("pnav"); if(tg) window.scrollTo({ top: tg.getBoundingClientRect().top + window.pageYOffset - (nav ? nav.offsetHeight : 0), behavior:"smooth" }); return; }
  var a = e.target.closest("[data-go]"); if(!a) return;
  if(a.getAttribute("target") === "_blank" && STATE.view === "register"){ return; } // opens the legal page in a new tab from the form
  e.preventDefault(); go(a.dataset.go);
  window.scrollTo(0, 0);
});
window.addEventListener("hashchange", function(){ var h = (location.hash || "").slice(1); if(h) go(h, false); });

function render(v){
  banner("");
  if(v === "week") renderWeek();
  if(v === "raceplan") renderRacePlan();
  if(v === "coach") renderCoach();
  if(v === "connect") renderConnect();
  if(v === "profile") renderProfile();
  if(v === "membership") renderMembership();
  if(v === "admin") renderAdmin();
}

/* ---------- auth ---------- */
async function loadUser(){
  if(!sb){ setTabs(); return; }
  var s = (await sb.auth.getSession()).data.session;
  STATE.user = s ? s.user : null; STATE.profile = null; STATE.admin = false;
  if(STATE.user){
    var p = await sb.from("profiles").select("*").eq("user_id", STATE.user.id).maybeSingle();
    STATE.profile = p.data;
    var a = await sb.from("admins").select("user_id").eq("user_id", STATE.user.id).maybeSingle();
    STATE.admin = !!a.data;
    if(STATE.profile && STATE.profile.lang !== LANG && !/[?&]lang=/.test(location.search)){ /* keep the browser choice; profile language is used for emails */ }
  }
  setTabs();
}
// A password reset link arrives with #access_token=...&type=recovery. Remember it, so the first
// routing after sign-in shows the new password form instead of the overview.
var RECOVERY = /type=recovery/.test(location.hash);
function showReset(){ go("signin"); $("signForm").hidden = true; $("resetForm").hidden = false; }
if(sb) sb.auth.onAuthStateChange(function(ev){
  if(ev === "PASSWORD_RECOVERY"){ RECOVERY = true; showReset(); }
  if(ev === "SIGNED_IN" || ev === "SIGNED_OUT") loadUser().then(function(){ if(STATE.view) render(STATE.view); });
});

/* register */
$("spForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("spErr"); ok("spOk", false);
  var ar = LANG === "ar";
  var row = { full_name:$("sp-name").value.trim(), email:$("sp-email").value.trim(), phone:$("sp-phone").value.trim(),
    sport:$("sp-sport").value, goal:$("sp-goal").value.trim() || null, experience:$("sp-exp").value.trim() || null,
    reason:$("sp-reason").value.trim(), lang:LANG, adult_confirmed:$("sp-adult").checked };
  if(row.full_name.length < 2) return err("spErr", t("eName"));
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return err("spErr", t("eEmail"));
  if(row.phone.replace(/\D/g,"").length < 6) return err("spErr", ar ? "يرجى كتابة رقم هاتف صحيح." : "Please enter a valid mobile number.");
  if(row.reason.length < 10) return err("spErr", ar ? "يرجى كتابة سطر أو سطرين عن سبب تقديمك." : "Please write a line or two on why you are applying.");
  if(!row.adult_confirmed) return err("spErr", ar ? "يرجى تأكيد أن عمرك 18 عاما أو أكثر." : "Please confirm that you are 18 or older.");
  if(!sb){ ok("spOk"); return; }
  var r = await sb.from("sponsorship_applications").insert(row);
  if(r.error) return err("spErr", ar ? "تعذر إرسال الطلب. يرجى المحاولة مرة أخرى." : "The application could not be sent. Please try again.");
  ok("spOk"); $("spForm").querySelectorAll("input,textarea").forEach(function(x){ if(x.type === "checkbox") x.checked = false; else x.value = ""; });
});

$("regForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("regErr"); ok("regOk", false);
  var n = $("r-name").value.trim(), m = $("r-email").value.trim(), p = $("r-pass").value, p2 = $("r-pass2").value, y = parseInt($("r-year").value, 10);
  var thisYear = new Date().getFullYear();
  if(n.length < 2) return err("regErr", t("eName"));
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return err("regErr", t("eEmail"));
  if(p.length < 10) return err("regErr", t("ePass"));
  if(p !== p2) return err("regErr", t("ePass2"));
  if(!y || y < 1920) return err("regErr", t("eYear"));
  if(thisYear - y < 18 || !$("c-age").checked) return err("regErr", t("eAge"));
  var all = ["c-terms","c-health","c-transfer","c-ai"].every(function(id){ return $(id).checked; });
  if(!all) return err("regErr", t("eConsent"));
  if(!sb){ ok("regOk"); $("regOk").textContent = t("ePreview"); return; }
  var r = await sb.auth.signUp({ email:m, password:p, options:{ emailRedirectTo: location.origin + location.pathname,
    data:{ full_name:n, country:$("r-country").value, birth_year:String(y), lang:LANG, consent_version:CONFIG.consentVersion,
      consents:{ age:true, terms:true, medical:true, health_data:true, transfer:true, ai_processing:true } } } });
  if(r.error) return err("regErr", t("eNet") + " " + r.error.message);
  window.__regEmail = m; $("regForm").reset(); $("regOk").textContent = t("regOk"); ok("regOk"); $("regResendBox").hidden = false;
});

/* sign in, reset */
$("signForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("signErr"); ok("signOk", false);
  if(!sb) return err("signErr", t("ePreview"));
  var r = await sb.auth.signInWithPassword({ email:$("s-email").value.trim(), password:$("s-pass").value });
  if(r.error){ if(/not confirmed/i.test(r.error.message || "") || r.error.code === "email_not_confirmed") return err("signErr", L("Your email address has not been confirmed yet. Open the confirmation link we sent you, or use Send it again below.", "لم يُؤكد بريدك الإلكتروني بعد. افتح رابط التأكيد الذي أرسلناه إليك، أو استخدم أعد إرسالها في الأسفل.")); return err("signErr", t("eSignin")); }
  await loadUser(); go(STATE.admin ? "admin" : "week");
});
$("forgotBtn").addEventListener("click", async function(){
  err("signErr"); var m = $("s-email").value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return err("signErr", t("eEmail"));
  if(!sb) return err("signErr", t("ePreview"));
  await sb.auth.resetPasswordForEmail(m, { redirectTo: location.origin + location.pathname });
  $("signOk").textContent = t("forgotSent"); ok("signOk");
});
$("resetForm").addEventListener("submit", async function(e){
  e.preventDefault(); var p = $("n-pass").value;
  if(p.length < 10) return err("resetErr", t("ePass"));
  var cur = (await sb.auth.getSession()).data.session;
  if(!cur && RECOVERY_TOKENS){ await sb.auth.setSession(RECOVERY_TOKENS); cur = (await sb.auth.getSession()).data.session; }
  if(!cur) return err("resetErr", t("eLinkOld"));
  var r = await sb.auth.updateUser({ password:p });
  if(r.error){
    var c = r.error.code || "";
    if(c === "same_password") return err("resetErr", t("eSamePass"));
    if(c === "weak_password") return err("resetErr", t("ePass") + " " + r.error.message);
    return err("resetErr", t("eNet") + " " + r.error.message);
  }
  RECOVERY = false; $("resetForm").hidden = true; $("signForm").hidden = false; banner(t("resetDone")); go("week");
});
$("outBtn").addEventListener("click", async function(){ if(sb) await sb.auth.signOut(); STATE.user = null; setTabs(); go("overview"); });

/* ---------- my week ---------- */
var SAMPLE = { week_index:6, phase:"build", weeks_to_race:8, race_name:"Ironman 70.3", race_date:addDays(todayStr(), 56),
  note_en:"Your check-ins show under six hours of sleep on two nights, so Thursday's tempo ride was made easy. Next week is a recovery week.",
  note_ar:"تُظهر تسجيلاتك أقل من ست ساعات نوم في ليلتين، لذلك خُففت حصة الدراجة يوم الخميس. والأسبوع القادم أسبوع استشفاء." };
function sampleSessions(){
  var ws = weekStartOf(todayStr());
  return [
    {day:ws, sport:"brick", intensity:"easy", title_en:"Long ride and short run", title_ar:"دراجة طويلة وجري قصير", minutes:215, steps:[{min:195,zone:2,label_en:"bike, easy",label_ar:"دراجة، سهل"},{min:20,zone:2,label_en:"run off the bike",label_ar:"جري بعد الدراجة"}]},
    {day:addDays(ws,1), sport:"swim", intensity:"moderate", title_en:"Swim, race pace set", title_ar:"سباحة بإيقاع السباق", minutes:60, steps:[{min:15,zone:2,label_en:"warm up",label_ar:"إحماء"},{min:3,zone:3,repeat:8,label_en:"100 m at race pace",label_ar:"100 م بإيقاع السباق"},{min:15,zone:1,label_en:"easy",label_ar:"سهل"}]},
    {day:addDays(ws,2), sport:"rest", intensity:"rest", title_en:"Rest", title_ar:"راحة", minutes:0, steps:[]},
    {day:addDays(ws,3), sport:"rest", intensity:"rest", title_en:"Rest", title_ar:"راحة", minutes:0, steps:[]},
    {day:addDays(ws,4), sport:"run", intensity:"hard", title_en:"Threshold intervals", title_ar:"فترات عند العتبة", minutes:55, steps:[{min:15,zone:2,label_en:"easy with strides",label_ar:"جري سهل مع تسارعات قصيرة"},{min:6,zone:4,repeat:4,label_en:"threshold, 2 min easy between",label_ar:"عند العتبة، دقيقتان سهلتان بينها"},{min:10,zone:1,label_en:"easy",label_ar:"سهل"}]},
    {day:addDays(ws,5), sport:"bike", intensity:"easy", title_en:"Easy ride", title_ar:"دراجة بإيقاع سهل", minutes:60, steps:[{min:60,zone:2,label_en:"easy",label_ar:"سهل"}], downgraded_reason:"sleep_floor"},
    {day:addDays(ws,6), sport:"run", intensity:"easy", title_en:"Long run", title_ar:"جري طويل", minutes:95, steps:[{min:95,zone:2,label_en:"easy",label_ar:"سهل"}]}
  ];
}
function stepText(s){
  return (s.repeat && s.repeat > 1 ? s.repeat + " × " : "") + s.min + " " + t("min") + sep() + t("zone") + " " + s.zone + ": " + (LANG === "ar" ? s.label_ar : s.label_en);
}
function sessionBlurb(s){
  if(s.sport === "rest" || !s.minutes) return t("rest");
  return hm(s.minutes);
}
function drawWeek(sessions, meta){
  var today = todayStr(), grid = $("weekGrid"); grid.innerHTML = "";
  var tc = $("todayCard"); tc.hidden = true; tc.innerHTML = "";
  var ws = weekStartOf(today);
  for(var i = 0; i < 7; i++){
    var day = addDays(ws, i), list = sessions.filter(function(s){ return s.day === day; });
    var box = el("div", {cls:"wd" + (day === today ? " today" : "")}, [el("p",{cls:"micro", text:t("dayShort")[dowKey(day)] + (day === today ? sep() + t("todayL") : "")})]);
    if(!list.length) list = [{sport:"rest", minutes:0, title_en:"Rest", title_ar:"راحة", intensity:"rest", steps:[]}];
    list.forEach(function(s){
      box.appendChild(el("b",{text: s.sport === "rest" ? t("rest") : (LANG === "ar" ? s.title_ar : s.title_en)}));
      if(s.sport !== "rest") box.appendChild(el("p",{text:sessionBlurb(s)}));
      var pur = LANG === "ar" ? s.purpose_ar : s.purpose_en; if(pur && s.sport !== "rest") box.appendChild(el("p",{cls:"note", text:pur}));
      if(s.intensity && s.intensity !== "rest") box.appendChild(el("span",{cls:"badge z" + (s.downgraded_reason ? " wait" : ""), text: s.downgraded_reason ? t("made_easier") : t(s.intensity)}));
      if(s.id) box.appendChild(el("div",{"data-sid":String(s.id)}));
    });
    grid.appendChild(box);
    if(day === today && list[0].sport !== "rest"){
      var s0 = list[0];
      tc.appendChild(el("p",{cls:"eyebrow", text:t("todayL")}));
      tc.appendChild(el("h3",{text:(LANG === "ar" ? s0.title_ar : s0.title_en) + sep() + hm(s0.minutes)}));
      var pur0 = LANG === "ar" ? s0.purpose_ar : s0.purpose_en; if(pur0) tc.appendChild(el("p",{text:pur0}));
      var ol = el("ol"); (s0.steps || []).forEach(function(st){ ol.appendChild(el("li",{text:stepText(st) + zoneHint(s0.sport, st.zone)})); }); tc.appendChild(ol);
      tc.appendChild(el("p",{cls:"sent", text: s0.sent_at ? t("sentGarmin") : t("notSent")}));
      tc.hidden = false;
    }
  }
  var note = LANG === "ar" ? meta.note_ar : meta.note_en;
  $("coachNote").hidden = !note; $("coachNoteText").textContent = note || "";
}
function drawStats(sessions, checkins){
  var total = 0, low = 0, all = 0;
  sessions.forEach(function(s){ total += s.minutes || 0; (s.steps && s.steps.length ? s.steps : [{min:s.minutes, zone: s.intensity === "hard" ? 4 : 2}]).forEach(function(st){ var m = st.min * (st.repeat || 1); all += m; if(st.zone <= 2) low += m; }); });
  var last7 = (checkins || []).filter(function(c){ return c.day >= addDays(todayStr(), -6); });
  function avgOf(k){ var xs = last7.map(function(c){ return c[k]; }).filter(function(x){ return typeof x === "number"; }); return xs.length ? xs.reduce(function(a,b){ return a+b; },0)/xs.length : null; }
  var sl = avgOf("sleep_hours"), hr = avgOf("resting_hr");
  var box = $("stats"); box.innerHTML = "";
  [[hm(total), t("sPlanned")], [all ? Math.round(low/all*100) + "%" : "0%", t("sLow")], [(sl !== null ? sl.toFixed(1) : "0") + (LANG === "ar" ? " س" : " h"), t("sSleep")], [hr !== null ? String(Math.round(hr)) : "0", t("sRhr")]]
    .forEach(function(x){ box.appendChild(el("div",{cls:"stat"},[el("p",{cls:"v",text:x[0]}), el("p",{cls:"l",text:x[1]})])); });
}
function drawChart(weeks){
  if(!weeks.length){ $("loadChart").hidden = true; return; }
  var max = Math.max.apply(null, weeks.map(function(w){ return w.minutes; }).concat([1]));
  var svg = '<svg viewBox="0 0 640 200" role="img" aria-label="' + t("chartH") + '"><line x1="40" y1="170" x2="630" y2="170" stroke="#E3DBD0" stroke-width="1"/>';
  weeks.forEach(function(w, i){
    var h = Math.round(w.minutes / max * 140), x = 60 + i * 72;
    svg += '<rect x="' + x + '" y="' + (170 - h) + '" rx="6" width="44" height="' + h + '" fill="' + (w.recovery ? "#E3DBD0" : "#D9401A") + '"/>';
    svg += '<text x="' + (x + 22) + '" y="190" font-family="Geist, sans-serif" font-size="12" fill="#8A8279" text-anchor="middle">' + w.week_start.slice(5) + '</text>';
  });
  $("chartSvg").innerHTML = svg + "</svg>"; $("loadChart").hidden = false;
}
async function renderWeek(){
  var lead = $("wkLead"), st = $("wkStatus"); st.innerHTML = ""; $("calCard").hidden = true;
  $("wkEyebrow").textContent = t("wkEyebrow");
  if(!sb){
    $("wkH").textContent = t("wkH")(SAMPLE.week_index, t("phases")[SAMPLE.phase]);
    lead.textContent = t("wkLead")("\u2068" + SAMPLE.race_name + "\u2069", fmtDate(SAMPLE.race_date), SAMPLE.weeks_to_race);
    var ss = sampleSessions(), sc = [6.1,5.8,7.2,6.9,7.4,6.6,7.0].map(function(h,i){ return {day:addDays(todayStr(), -i), sleep_hours:h, resting_hr:[53,52,51,52,52,51,53][i]}; });
    drawWeek(ss, SAMPLE); drawStats(ss, sc);
    drawChart([["10-03",300,0],["10-10",340,0],["10-17",380,0],["10-24",230,1],["10-31",400,0],["11-07",440,0],["11-14",470,0],["11-21",490,0]].map(function(x){ return {week_start:"2026-" + x[0], minutes:x[1], recovery:!!x[2]}; }));
    return;
  }
  var p = STATE.profile || {};
  if(p.status === "pending_payment"){ $("wkH").textContent = t("wkPending"); lead.textContent = t("wkPendingP"); clearWeek(); return; }
  if(p.status === "paused"){ $("wkH").textContent = t("wkPaused"); lead.textContent = t("wkPausedP"); clearWeek(); return; }
  drawCal();
  var ws = weekStartOf(todayStr());
  // Show this week's plan; if there is none yet (plans are written on Thursday night for the week
  // starting Saturday), show the coming week so athletes can see tomorrow's session.
  var plans = (await sb.from("plans").select("*").eq("user_id", STATE.user.id).in("week_start", [ws, addDays(ws, 7)]).in("status",["approved","sent"]).order("week_start",{ascending:true}).order("created_at",{ascending:false})).data || [];
  var plan = plans.filter(function(x){ return x.week_start === ws; })[0] || plans[0];
  var cks = (await sb.from("checkins").select("day,sleep_hours,resting_hr").eq("user_id", STATE.user.id).gte("day", addDays(todayStr(), -7))).data || [];
  if(!plan){ $("wkH").textContent = t("wkNone"); lead.textContent = t("wkNoneP"); clearWeek(); drawStats([], cks); }
  else{
    var sessions = (await sb.from("sessions").select("*").eq("plan_id", plan.id).order("day")).data || [];
    $("wkH").textContent = t("wkH")(plan.week_index || 1, t("phases")[plan.phase] || plan.phase || "");
    lead.textContent = p.race_name || p.race_date ? t("wkLead")("\u2068" + (p.race_name || "") + "\u2069", p.race_date ? fmtDate(p.race_date) : "", plan.weeks_to_race || "") : "";
    drawWeek(sessions, {note_en:plan.coach_note_en, note_ar:plan.coach_note_ar}); drawStats(sessions, cks);
    var cond = (await sb.from("session_conditions").select("session_id,wbgt,action").in("session_id", sessions.map(function(s){ return s.id; }))).data || [];
    cond.forEach(function(c){ var b = document.querySelector('[data-sid="' + c.session_id + '"]'); if(b && c.wbgt != null) b.appendChild(el("p",{cls:"note cond", text:t("condL")(c.wbgt, (t("condA") || {})[c.action] || "")})); });
  }
  var hist = (await sb.from("plans").select("id,week_start,is_recovery").eq("user_id", STATE.user.id).in("status",["approved","sent"]).order("week_start",{ascending:false}).limit(8)).data || [];
  var weeks = [];
  for(var i = hist.length - 1; i >= 0; i--){
    var s2 = (await sb.from("sessions").select("minutes").eq("plan_id", hist[i].id)).data || [];
    weeks.push({week_start:hist[i].week_start, minutes:s2.reduce(function(a,b){ return a + b.minutes; },0), recovery:hist[i].is_recovery});
  }
  drawChart(weeks);
  drawPrediction(); drawRacePlanCard();
  var wk = (await sb.from("workouts").select("id,started_at,sport,duration_s,distance_m,device_name").eq("user_id", STATE.user.id).order("started_at",{ascending:false}).limit(8)).data || [];
  var notes = wk.length ? ((await sb.from("workout_notes").select("workout_id,text_en,text_ar").in("workout_id", wk.map(function(x){ return x.id; }))).data || []) : [];
  var rl = $("recentList"); rl.innerHTML = ""; $("recent").hidden = !wk.length;
  wk.forEach(function(w){
    var left = w.started_at.slice(0,10) + ", " + w.sport + ", " + hm(w.duration_s/60) + (w.distance_m ? ", " + (w.distance_m/1000).toFixed(1) + " km" : "");
    var right = w.device_name && /garmin/i.test(w.device_name) ? t("garminAttr") + " " + w.device_name.replace(/^garmin\s*/i, "") : (w.device_name || "");
    rl.appendChild(el("li",{},[el("span",{text:left, dir:"ltr"}), el("span",{cls:"attrib", text:right})]));
    var nt = notes.filter(function(n){ return n.workout_id === w.id; })[0];
    if(nt) rl.appendChild(el("li",{cls:"wnote"},[el("span",{text: LANG === "ar" ? nt.text_ar : nt.text_en})]));
  });
}
/* ---------- calendar subscription ---------- */
function calFeed(){ var p = STATE.profile || {}; return p.calendar_token ? CONFIG.supabaseUrl + "/functions/v1/calendar-feed?t=" + p.calendar_token : ""; }
function drawCal(){
  var url = calFeed(), c = $("calCard");
  if(!sb || !url){ c.hidden = true; return; }
  var web = url.replace(/^https:/, "webcal:");
  $("calApple").href = web;
  $("calGoogle").href = "https://calendar.google.com/calendar/r?cid=" + encodeURIComponent(web);
  $("calOutlook").href = "https://outlook.live.com/calendar/0/addfromweb?url=" + encodeURIComponent(url) + "&name=" + encodeURIComponent(LANG === "ar" ? "تدريب المنهج العربي" : "Arabian Method training");
  c.hidden = false;
}
$("calCopy").addEventListener("click", function(){
  var url = calFeed(); if(!url) return;
  var done = function(){ banner(t("calCopied")); };
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function(){ prompt("", url); });
  else prompt("", url);
});
$("calReset").addEventListener("click", async function(){
  if(!sb || !confirm(t("calResetQ"))) return;
  var r = await sb.rpc("reset_calendar_token");
  if(r.error){ banner(t("eNet"), true); return; }
  STATE.profile.calendar_token = r.data; drawCal(); banner(t("calResetDone"));
});
function clearWeek(){ $("weekGrid").innerHTML = ""; $("todayCard").hidden = true; $("coachNote").hidden = true; $("stats").innerHTML = ""; $("loadChart").hidden = true; $("recent").hidden = true; }

function ramToggle(){ var v = $("p-ram").value; $("p-ram-more").hidden = !(v === "fasting" || v === "partly"); $("p-ram-daysf").hidden = v !== "partly"; }
$("p-ram").addEventListener("change", ramToggle);
/* ---------- diary ---------- */
async function drawDiary(){
  err("dyErr");
  if(!sb){ $("diaryOff").hidden = false; $("diaryOn").hidden = true; return; }
  var f = (await sb.from("diary_feeds").select("connected_at,last_sync,last_error").eq("user_id", STATE.user.id).maybeSingle()).data;
  $("diaryOff").hidden = !!f; $("diaryOn").hidden = !f;
  if(!f) return;
  var st = $("dyStatus"), dt = $("dyDetail");
  if(f.last_error){ st.className = "badge no"; st.textContent = t("dyH"); dt.textContent = t("dyFail")(f.last_error); return; }
  if(!f.last_sync){ st.className = "badge wait"; st.textContent = t("dyH"); dt.textContent = t("dyWaiting"); return; }
  var c = (await sb.from("busy_blocks").select("id", { count:"exact", head:true }).eq("user_id", STATE.user.id)).count || 0;
  st.className = "badge ok"; st.textContent = t("dyH"); dt.textContent = t("dyOk")(c, f.last_sync.slice(0,16).replace("T"," "));
}
$("dyConnect").addEventListener("click", async function(){
  err("dyErr"); var u = $("dy-url").value.trim();
  if(!/^(https|webcal):\/\/[^\s]+$/i.test(u) || !/(calendar\.google\.com|outlook\.(live|office365|office)\.com|icloud\.com)/i.test(u)) return err("dyErr", t("dyBad"));
  if(!sb){ banner(t("ePreview")); return; }
  var r = await sb.from("diary_feeds").upsert({ user_id:STATE.user.id, url:u, connected_at:new Date().toISOString(), last_sync:null, last_error:null }, { onConflict:"user_id" });
  if(r.error) return err("dyErr", t("eNet"));
  $("dy-url").value = ""; drawDiary();
});
$("dyDisconnect").addEventListener("click", async function(){
  if(!sb) return;
  var r = await sb.from("diary_feeds").delete().eq("user_id", STATE.user.id);
  if(r.error){ banner(t("eNet"), true); return; }
  await sb.from("busy_blocks").delete().eq("user_id", STATE.user.id);
  banner(t("dyGone")); drawDiary();
});

/* ---------- notifications ---------- */
function pushSupported(){ return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window; }
async function drawPush(){
  var c = $("pushCard"); if(!sb){ c.hidden = true; return; }
  c.hidden = false;
  var btnP = $("pushBtn"), txt = $("pushText");
  if(!pushSupported()){ txt.textContent = t("puIos"); btnP.hidden = true; return; }
  if(Notification.permission === "denied"){ txt.textContent = t("puDenied"); btnP.hidden = true; return; }
  var reg = await navigator.serviceWorker.getRegistration("/");
  var sub = reg ? await reg.pushManager.getSubscription() : null;
  if(sub && Notification.permission === "granted"){ txt.textContent = t("puOn"); btnP.hidden = true; return; }
  txt.textContent = t("puOff"); btnP.hidden = false;
}
function b64uToBytes(s){ var p = "=".repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); var a = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
$("pushBtn").addEventListener("click", async function(){
  try{
    var perm = await Notification.requestPermission();
    if(perm !== "granted"){ drawPush(); return; }
    var reg = await navigator.serviceWorker.register("/sw.js", { scope:"/" });
    await navigator.serviceWorker.ready;
    var k = (await sb.from("push_public_key").select("public_key").maybeSingle()).data;
    if(!k){ banner(t("eNet"), true); return; }
    var sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:b64uToBytes(k.public_key) });
    var j = sub.toJSON();
    var r = await sb.from("push_subscriptions").upsert({ user_id:STATE.user.id, endpoint:j.endpoint, p256dh:j.keys.p256dh, auth:j.keys.auth }, { onConflict:"endpoint" });
    if(r.error){ banner(t("eNet"), true); return; }
    banner(t("puDone")); drawPush();
  }catch(e){ banner(t("eNet"), true); }
});

/* ---------- voice (built into the browser or phone; no extra cost) ---------- */
function speak(text){
  try{
    speechSynthesis.cancel();
    var ar = /[\u0600-\u06FF]/.test(text), u = new SpeechSynthesisUtterance(text);
    u.lang = ar ? "ar-SA" : "en-US";
    var vs = speechSynthesis.getVoices().filter(function(v){ return v.lang && v.lang.toLowerCase().indexOf(ar ? "ar" : "en") === 0; });
    if(vs.length) u.voice = vs[0];
    speechSynthesis.speak(u);
  }catch(e){}
}
var REC = null;
function setupMic(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, mb = $("micBtn");
  mb.hidden = false;
  if(!SR){ mb.addEventListener("click", function(){ var n = $("micNote"); n.textContent = t("chMicNo"); n.hidden = false; }); return; }
  mb.addEventListener("click", function(){
    var n = $("micNote"), box = $("chatIn");
    if(REC){ REC.stop(); return; }
    REC = new SR(); REC.lang = LANG === "ar" ? "ar-BH" : "en-US"; REC.interimResults = true; REC.continuous = false;
    var before = box.value ? box.value.trim() + " " : "";
    REC.onresult = function(e){ var s = ""; for(var i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; box.value = before + s; box.dataset.source = "voice"; };
    REC.onerror = function(){ n.textContent = t("chMicErr"); n.hidden = false; };
    REC.onend = function(){ REC = null; $("micLabel").textContent = t("chMic"); if(!n.textContent || n.textContent === t("chMicHint")) n.hidden = true; box.focus(); };
    n.textContent = t("chMicHint"); n.hidden = false; $("micLabel").textContent = t("chMicStop");
    try{ REC.start(); }catch(err){ REC = null; n.textContent = t("chMicErr"); }
  });
}
setupMic();

/* ---------- coach chat ---------- */
function chatBubble(m){
  var who = m.role === "athlete" ? t("chYou") : m.role === "admin" ? t("chDr") : t("chCoach");
  var b = el("div",{cls:"msg " + (m.role === "athlete" ? "me" : "them")},[el("p",{cls:"micro", text:who}), el("p",{text:m.body, dir:"auto"})]);
  if(m.role !== "athlete" && "speechSynthesis" in window){
    var lb = el("button",{cls:"linkbtn listen", type:"button", text:t("chListen")});
    lb.addEventListener("click", function(){ speak(m.body); });
    b.appendChild(lb);
  }
  return b;
}
function drawChat(msgs){
  var log = $("chatLog"); log.innerHTML = "";
  if(!msgs.length){ log.appendChild(el("p",{cls:"note", text:t("chHello")})); return; }
  msgs.forEach(function(m){ log.appendChild(chatBubble(m)); });
  log.scrollTop = log.scrollHeight;
}
async function renderCoach(){
  drawPush();
  if(!sb){ drawChat([]); return; }
  var r = await sb.from("coach_messages").select("id,created_at,role,body,source,pending").eq("user_id", STATE.user.id).order("created_at",{ascending:false}).limit(60);
  drawChat((r.data || []).reverse());
}
async function sendCoach(text, source){
  err("chatErr");
  if(!text){ err("chatErr", t("chEmpty")); return false; }
  if(!sb){ banner(t("ePreview")); return false; }
  var log = $("chatLog"); var hello = log.querySelector(".note"); if(hello) hello.remove();
  log.appendChild(chatBubble({role:"athlete", body:text}));
  var wait = el("p",{cls:"note typing", text:t("chThinking")}); log.appendChild(wait); log.scrollTop = log.scrollHeight;
  $("chatSend").disabled = true;
  try{
    var s = (await sb.auth.getSession()).data.session;
    var res = await fetch(CONFIG.supabaseUrl + "/functions/v1/coach-chat", { method:"POST", headers:{ "Content-Type":"application/json", "Authorization":"Bearer " + s.access_token, "apikey":CONFIG.supabaseKey }, body:JSON.stringify({ text:text, source:source || "chat" }) });
    var j = await res.json();
    if(!res.ok || !j.messages) throw new Error(j.error || res.status);
    drawChat(j.messages);
    await loadUser();
    return true;
  }catch(e){ wait.remove(); err("chatErr", t("eNet")); return false; }
  finally{ $("chatSend").disabled = false; }
}
$("chatForm").addEventListener("submit", async function(e){
  e.preventDefault(); var box = $("chatIn"), text = box.value.trim();
  if(await sendCoach(text, box.dataset.source || "chat")){ box.value = ""; box.dataset.source = ""; }
});
$("chatIn").addEventListener("keydown", function(e){ if(e.key === "Enter" && (e.metaKey || e.ctrlKey)){ e.preventDefault(); $("chatForm").requestSubmit(); } });

/* ---------- check-in, watch, uploads, clearance ---------- */
async function renderConnect(){
  var q = location.hash.split("?")[1] || "";
  if(/intervals=ok/.test(q)) banner(t("gDone")); else if(/intervals=/.test(q)) banner(t("gFail"), true);
  if(!sb) return;
  var p = STATE.profile || {};
  var gs = $("g-status"); gs.textContent = p.intervals_connected_at ? t("gOk") : t("gNot"); gs.className = "badge" + (p.intervals_connected_at ? " ok" : "");
  $("g-btn").textContent = p.intervals_connected_at ? t("gAgain") : t("gBtn");
  $("clearCard").hidden = !(p.status === "paused" && /pain|illness|warning|resting_hr/.test(p.pause_reason || ""));
  var c = (await sb.from("checkins").select("*").eq("user_id", STATE.user.id).eq("day", todayStr()).eq("source","checkin").maybeSingle()).data;
  if(c){ var cs = $("c-status"); cs.textContent = t("ciSent"); cs.className = "badge ok"; }
}
$("ciForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("ciErr"); ok("ciPaused", false); ok("ciUrgent", false);
  var s = $("c-sleep").value, f = $("c-feel").value;
  if(s === "") return err("ciErr", t("eSleep"));
  if(!f) return err("ciErr", t("eFeel"));
  var row = { day:todayStr(), source:"checkin", sleep_hours:Number(s), resting_hr:$("c-rhr").value ? Number($("c-rhr").value) : null, feel:f,
    pain:$("c-pain").checked, ill:$("c-ill").checked, fever:$("c-fever").checked, warning_symptom:$("c-warn").checked, note:$("c-note").value.trim() || null };
  var stop = row.pain || row.ill || row.fever || row.warning_symptom;
  if(sb){
    row.user_id = STATE.user.id;
    var r = await sb.from("checkins").upsert(row, { onConflict:"user_id,day,source" });
    if(r.error) return err("ciErr", t("eNet"));
    await loadUser();
  }
  var cs = $("c-status"); cs.textContent = stop ? t("ciPausedBadge") : t("ciSent"); cs.className = "badge " + (stop ? "no" : "ok");
  if(row.warning_symptom) ok("ciUrgent"); else if(stop) ok("ciPaused");
  if(!sb) banner(t("ePreview"));
});
$("g-btn").addEventListener("click", async function(){
  if(!sb || !CONFIG.intervalsClientId){ banner(t("ePreview")); return; }
  var state = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)) + Date.now().toString(36);
  var r = await sb.from("oauth_states").insert({ state:state, user_id:STATE.user.id });
  if(r.error){ banner(t("eNet"), true); return; }
  var redirect = CONFIG.supabaseUrl + "/functions/v1/intervals-oauth";
  location.href = "https://intervals.icu/oauth/authorize?client_id=" + encodeURIComponent(CONFIG.intervalsClientId) +
    "&redirect_uri=" + encodeURIComponent(redirect) + "&scope=" + encodeURIComponent("ACTIVITY:READ,WELLNESS:READ,CALENDAR:WRITE") + "&state=" + encodeURIComponent(state);
});
var fileList = $("files"), drop = $("drop"), fin = $("fileIn");
async function addFiles(fs){
  for(var i = 0; i < fs.length; i++){
    var f = fs[i], good = /\.(fit|tcx|gpx)$/i.test(f.name) && f.size < 30 * 1024 * 1024;
    var status = el("span",{text: good ? "…" : t("uBad")}); status.style.color = good ? "#6F5D4A" : "#8C3A30";
    fileList.appendChild(el("li",{},[el("span",{text:f.name, dir:"ltr"}), status]));
    if(!good) continue;
    if(!sb){ status.textContent = t("uOk"); status.style.color = "#3F6B4F"; continue; }
    var path = STATE.user.id + "/" + Date.now() + "-" + f.name.replace(/[^\w.\-]+/g, "_");
    var up = await sb.storage.from("workout-files").upload(path, f);
    if(up.error){ status.textContent = t("uErr"); status.style.color = "#8C3A30"; continue; }
    var res = await sb.functions.invoke("parse-upload", { body:{ path:path } });
    status.textContent = res.error ? t("uErr") : t("uOk"); status.style.color = res.error ? "#8C3A30" : "#3F6B4F";
  }
  var n = fileList.querySelectorAll("li").length, us = $("u-status"); us.textContent = String(n); us.className = "badge ok";
}
fin.addEventListener("change", function(){ addFiles(fin.files); fin.value = ""; });
["dragenter","dragover"].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add("over"); }); });
["dragleave","drop"].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove("over"); }); });
drop.addEventListener("drop", function(e){ if(e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
$("clearForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("clearErr");
  if(!$("clr-ok").checked) return err("clearErr", t("eClear"));
  if(sb){ var r = await sb.from("clearances").insert({ user_id:STATE.user.id, statement:t("clearCheck") }); if(r.error) return err("clearErr", t("eNet")); }
  ok("clearOk");
});

/* ---------- profile and data rights ---------- */
function setChecks(id, vals){ $(id).querySelectorAll("input").forEach(function(i){ i.checked = (vals || []).indexOf(i.value) > -1; }); }
function getChecks(id){ return Array.prototype.map.call($(id).querySelectorAll("input:checked"), function(i){ return i.value; }); }
async function renderProfile(){
  var p = STATE.profile;
  if(p){
    $("p-race").value = p.race_name || ""; $("p-date").value = p.race_date || ""; $("p-dist").value = p.race_distance || "";
    $("p-years").value = p.years_training || ""; $("p-hours").value = p.weekly_hours || "";
    if(p.train_days && p.train_days.length) setChecks("p-days", p.train_days); if(p.swim_days && p.swim_days.length) setChecks("p-swim", p.swim_days);
    $("p-long").value = p.long_day || "Fri"; $("p-time").value = p.train_time || "early";
    $("p-hr").checked = p.has_hr !== false; $("p-power").checked = !!p.has_power; $("p-trainer").checked = !!p.has_trainer; $("p-inj").value = p.injuries || ""; $("p-nudge").checked = p.nudges_enabled !== false;
    $("p-heat").checked = !!(p.heat_new_until && p.heat_new_until >= todayStr());
    $("p-strength").value = p.strength_pref || "none"; $("p-summer").value = p.summer_mode || "auto"; $("p-racecond").value = p.race_conditions || "";
    $("p-ram").value = p.ramadan_mode || ""; setChecks("p-ram-days", p.ramadan_days || []);
    $("p-ram-start").value = p.ramadan_start || "";
    if(!p.ramadan_start && sb) sb.from("ramadan_dates").select("starts").in("country", [p.country, "Other"]).gte("ends", todayStr()).order("starts").limit(1).then(function(r){ if(r.data && r.data[0] && !$("p-ram-start").value) $("p-ram-start").value = r.data[0].starts; });
    ramToggle();
  }
  drawDiary(); drawFitness(); drawSweat();
  var list = $("consList"); list.innerHTML = "";
  if(!sb) return;
  var cs = (await sb.from("consents").select("*").eq("user_id", STATE.user.id).order("given_at")).data || [];
  $("p-ram-cons-l").hidden = cs.some(function(c){ return c.kind === "religion" && !c.withdrawn_at; });
  var names = {age:"kAge", terms:"kTerms", medical:"kMedical", health_data:"kHealth", transfer:"kTransfer", ai_processing:"kAi", email:"kEmail", religion:"kReligion"};
  cs.forEach(function(c){
    var right = c.withdrawn_at ? el("span",{cls:"badge no", text:t("withdrawn")}) : el("button",{cls:"btn ghost small", type:"button", text:t("withdraw")});
    if(!c.withdrawn_at) right.addEventListener("click", async function(){
      if(!confirm(t("confirmWithdraw"))) return;
      await sb.from("consents").update({ withdrawn_at:new Date().toISOString() }).eq("id", c.id);
      await loadUser(); renderProfile();
    });
    list.appendChild(el("li",{},[el("span",{text:t(names[c.kind]) + ", " + t("given") + " " + c.given_at.slice(0,10) + ", " + c.version}), right]));
  });
}
$("profForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("profErr"); ok("profOk", false);
  var date = $("p-date").value, days = getChecks("p-days");
  if(!date || date <= todayStr()) return err("profErr", t("eDate"));
  if(!$("p-dist").value) return err("profErr", t("eDist"));
  if(!$("p-years").value) return err("profErr", t("eYears"));
  if(days.length < 3) return err("profErr", t("eDays"));
  var row = { race_name:$("p-race").value.trim() || null, race_date:date, race_distance:$("p-dist").value, years_training:$("p-years").value,
    weekly_hours:$("p-hours").value ? Number($("p-hours").value) : 0, train_days:days, swim_days:getChecks("p-swim"), long_day:$("p-long").value,
    train_time:$("p-time").value, has_hr:$("p-hr").checked, has_power:$("p-power").checked, has_trainer:$("p-trainer").checked,
    injuries:$("p-inj").value.trim() || null, nudges_enabled:$("p-nudge").checked, lang:LANG,
    ramadan_mode:$("p-ram").value || null, ramadan_start:$("p-ram").value && $("p-ram").value !== "not_fasting" ? ($("p-ram-start").value || null) : null, ramadan_days:$("p-ram").value === "partly" ? getChecks("p-ram-days") : [],
    strength_pref:$("p-strength").value || "none", summer_mode:$("p-summer").value || "auto", race_conditions:$("p-racecond").value || null,
    heat_new_until:$("p-heat").checked ? ((STATE.profile && STATE.profile.heat_new_until && STATE.profile.heat_new_until >= todayStr()) ? STATE.profile.heat_new_until : addDays(todayStr(), 14)) : null };
  if(!sb){ ok("profOk"); $("profOk").textContent = t("ePreview"); return; }
  if(row.ramadan_mode === "fasting" || row.ramadan_mode === "partly"){
    var hasC = (await sb.from("consents").select("id").eq("user_id", STATE.user.id).eq("kind","religion").is("withdrawn_at", null).limit(1)).data;
    if(!hasC || !hasC.length){
      if(!$("p-ram-cons").checked) return err("profErr", t("eRamCons"));
      var cr = await sb.from("consents").insert({ user_id:STATE.user.id, kind:"religion", version:"2026-11-10", lang:LANG });
      if(cr.error) return err("profErr", t("eNet"));
    }
  }
  var r = await sb.from("profiles").update(row).eq("user_id", STATE.user.id);
  if(r.error) return err("profErr", t("eNet"));
  await loadUser(); $("profOk").textContent = t("profOk"); ok("profOk");
});
$("dlBtn").addEventListener("click", async function(){
  if(!sb){ banner(t("ePreview")); return; }
  var s = (await sb.auth.getSession()).data.session;
  var r = await fetch(CONFIG.supabaseUrl + "/functions/v1/account", { method:"POST", headers:{ "Authorization":"Bearer " + s.access_token, "apikey":CONFIG.supabaseKey, "Content-Type":"application/json" }, body:JSON.stringify({ action:"export" }) });
  if(!r.ok){ banner(t("eNet"), true); return; }
  var blob = await r.blob(), a = el("a",{ href:URL.createObjectURL(blob), download:"ai-coach-data.json" }); document.body.appendChild(a); a.click(); a.remove();
});
$("delBtn").addEventListener("click", async function(){
  err("delErr");
  if($("delConfirm").value.trim() !== "DELETE") return err("delErr", t("eDel"));
  if(!sb){ banner(t("ePreview")); return; }
  var res = await sb.functions.invoke("account", { body:{ action:"delete" } });
  if(res.error) return err("delErr", t("eNet"));
  await sb.auth.signOut(); STATE.user = null; setTabs(); go("overview"); banner(t("delDone"));
});

/* ---------- membership ---------- */
function dl(id, rows){ var d = $(id); d.innerHTML = ""; rows.forEach(function(r){ d.appendChild(el("dt",{text:r[0]})); d.appendChild(el("dd",{text:r[1], dir:"ltr"})); }); }
async function renderMembership(){
  var noDetails = /^\[/.test(CONFIG.benefitPay.number);
  $("bpDetails").hidden = noDetails; $("bankDetails").hidden = noDetails;
  if(noDetails && $("payLaterNote") === null){ var nt = el("p",{cls:"note", id:"payLaterNote"}); $("bpDetails").parentNode.insertBefore(nt, $("bpDetails")); }
  if($("payLaterNote")){ $("payLaterNote").textContent = t("payLater"); $("payLaterNote").hidden = !noDetails; }
  dl("bpDetails", [[t("dName"), CONFIG.benefitPay.name], [t("dNumber"), CONFIG.benefitPay.number], [t("dRef"), STATE.profile ? STATE.profile.full_name : "Arabian Method"]]);
  dl("bankDetails", [[t("dHolder"), CONFIG.bank.holder], [t("dBank"), CONFIG.bank.bank], [t("dIban"), CONFIG.bank.iban], [t("dSwift"), CONFIG.bank.swift], [t("dRef"), STATE.profile ? STATE.profile.full_name : "Arabian Method"]]);
  var ms = $("memStatus"), form = $("payForm");
  if(!STATE.user){ ms.textContent = sb ? t("signedOutMem") : t("memLead"); form.hidden = !!sb; return; }
  form.hidden = false;
  var p = STATE.profile || {};
  ms.textContent = p.trial && !p.trial_started_at && p.status === "active" ? t("stTrialWait") : p.trial && p.status === "active" && p.paid_until && p.trial_started_at && !STATE.hasPaid ? t("stTrial")(fmtDate(p.paid_until)) : p.status === "active" ? t("stActive")(fmtDate(p.paid_until)) : p.status === "pending_payment" ? t("stPending") : p.status === "closed" ? t("stClosed") : t("stPaused");
  var list = $("payList"); list.innerHTML = "";
  var pays = (await sb.from("payments").select("*").eq("user_id", STATE.user.id).order("created_at",{ascending:false}).limit(12)).data || [];
  STATE.hasPaid = pays.some(function(x){ return x.status === "confirmed"; });
  if(STATE.hasPaid && p.status === "active") ms.textContent = t("stActive")(fmtDate(p.paid_until));
  pays.forEach(function(x){
    var label = {reported:t("pReported"), confirmed:t("pConfirmed"), rejected:t("pRejected")}[x.status];
    list.appendChild(el("li",{},[el("span",{text:x.created_at.slice(0,10) + ", US$" + x.amount + ", " + x.reference, dir:"ltr"}), el("span",{cls:"badge" + (x.status === "confirmed" ? " ok" : x.status === "rejected" ? " no" : " wait"), text:label})]));
  });
}
$("payForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("payErr"); ok("payOk", false);
  var ref = $("pay-ref").value.trim(), months = Number($("pay-months").value);
  if(ref.length < 3) return err("payErr", t("eRef"));
  if(!sb){ ok("payOk"); $("payOk").textContent = t("ePreview"); return; }
  var r = await sb.from("payments").insert({ user_id:STATE.user.id, method:$("pay-method").value, amount:CONFIG.fee * months, months:months, reference:ref });
  if(r.error) return err("payErr", t("eNet"));
  $("pay-ref").value = ""; $("payOk").textContent = t("payOk"); ok("payOk"); renderMembership();
});

/* ---------- admin ---------- */
function table(head, rows){
  var tb = el("table"), tr = el("tr"); head.forEach(function(h){ tr.appendChild(el("th",{text:h})); }); tb.appendChild(tr);
  rows.forEach(function(r){ var row = el("tr"); r.forEach(function(c){ var td = el("td"); if(typeof c === "string") td.textContent = c; else td.appendChild(c); row.appendChild(td); }); tb.appendChild(row); });
  return tb;
}
function btn(label, fn, cls){ var b = el("button",{cls:"btn small " + (cls || ""), type:"button", text:label}); b.addEventListener("click", async function(){ b.disabled = true; await fn(); renderAdmin(); }); return b; }
async function renderAdmin(){
  if(!sb || !STATE.admin) return;
  var people = (await sb.from("profiles").select("user_id,full_name,status,pause_reason,paid_until,race_distance,race_date,created_at,intervals_connected_at,first_plan_approved").order("created_at",{ascending:false})).data || [];
  var name = {}; people.forEach(function(p){ name[p.user_id] = p.full_name; });
  function section(id, title, node){ var box = $(id); box.innerHTML = ""; box.appendChild(el("h3",{text:title})); box.appendChild(node || el("p",{cls:"note", text:t("none")})); }

  var apps = (await sb.from("sponsorship_applications").select("*").order("created_at",{ascending:false}).limit(100)).data || [];
  if(apps.length){
    var tb = el("table",{},[el("tr",{},["Date","Name","Sport","Contact","Goal","Why","Status"].map(function(h){ return el("th",{text:h}); }))]);
    apps.forEach(function(a){
      var st = el("select",{cls:"sel"},["new","accepted","declined"].map(function(v){ var o = el("option",{value:v, text:v}); if(v === a.status) o.selected = true; return o; }));
      st.addEventListener("change", async function(){ await sb.from("sponsorship_applications").update({status:st.value, reviewed_at:new Date().toISOString()}).eq("id", a.id); });
      tb.appendChild(el("tr",{},[el("td",{text:a.created_at.slice(0,10)}), el("td",{text:a.full_name}), el("td",{text:a.sport}), el("td",{text:a.email + " " + a.phone}), el("td",{text:a.goal || ""}), el("td",{text:a.reason}), el("td",{},[st])]));
    });
    section("admSponsor", "Sponsorship applications (" + apps.filter(function(a){ return a.status === "new"; }).length + " new)", el("div",{cls:"card"},[tb]));
  } else section("admSponsor", "Sponsorship applications");
  var chats = (await sb.from("coach_messages").select("id,created_at,user_id,role,body,pending").order("created_at",{ascending:false}).limit(300)).data || [];
  var byUser = {}; chats.forEach(function(m){ (byUser[m.user_id] = byUser[m.user_id] || []).push(m); });
  var cbox = el("div");
  Object.keys(byUser).forEach(function(uid){
    var list = byUser[uid].slice(0, 12).reverse();
    var waiting = byUser[uid].some(function(m){ return m.pending; });
    var card = el("div",{cls:"card"},[el("p",{cls:"micro", text:(name[uid] || "Athlete") + (waiting ? ", " + t("admWaiting") : "")})]);
    list.forEach(function(m){ card.appendChild(el("p",{cls:"note", dir:"auto", text:m.created_at.slice(5,16).replace("T"," ") + "  " + (m.role === "athlete" ? "Athlete" : m.role === "admin" ? "Dr. Saqer" : "Coach") + (m.pending ? " (held)" : "") + ": " + m.body})); });
    var ta = el("textarea",{cls:"ta", rows:"2", maxlength:"2000"});
    card.appendChild(ta);
    card.appendChild(el("div",{cls:"ck-cta"},[btn(t("admReply"), async function(){
      var v = ta.value.trim(); if(!v) return;
      await sb.from("coach_messages").insert({ user_id:uid, role:"admin", body:v, source:"chat" });
      await sb.from("coach_messages").update({ pending:false }).eq("user_id", uid).eq("pending", true);
    })]));
    cbox.appendChild(card);
  });
  section("admChats", t("admChats"), Object.keys(byUser).length ? cbox : null);
  var flags = (await sb.from("flags").select("*").is("resolved_at", null).order("urgent",{ascending:false}).order("created_at")).data || [];
  section("admFlags", t("admFlags"), flags.length ? table(["", "", "", ""], flags.map(function(f){
    return [f.created_at.slice(0,16).replace("T"," "), name[f.user_id] || "", (f.urgent ? "URGENT, " : "") + f.reason.replace(/_/g," ") + (f.detail ? ": " + f.detail : ""),
      btn(t("resolve"), function(){ return sb.from("flags").update({ resolved_at:new Date().toISOString() }).eq("id", f.id); }, "ghost")];
  })) : null);

  var plans = (await sb.from("plans").select("*").eq("status","awaiting_approval").order("week_start")).data || [];
  var pbox = el("div");
  for(var i = 0; i < plans.length; i++){
    (function(pl){
      var card = el("div",{cls:"card"},[el("p",{cls:"micro", text:(name[pl.user_id] || "") + ", " + pl.week_start + ", " + (pl.phase || "") + (pl.is_recovery ? ", recovery" : "") + (pl.is_taper ? ", taper" : "")}), el("p",{text:pl.coach_note_en || ""})]);
      pbox.appendChild(card);
      sb.from("sessions").select("*").eq("plan_id", pl.id).order("day").then(function(r){
        card.appendChild(table(["", "", "", ""], (r.data || []).map(function(s){ return [s.day + " " + dowKey(s.day), s.title_en + (s.downgraded_reason ? " (" + s.downgraded_reason + ")" : ""), s.intensity, hm(s.minutes)]; })));
        var v = pl.validation || [];
        if(v.length) card.appendChild(el("p",{cls:"note", text:t("ruleNotes") + ": " + v.map(function(x){ return x.message + " (" + (x.fixed ? t("fixed") : t("unresolved")) + ")"; }).join(" ")}));
        card.appendChild(el("div",{cls:"ck-cta"},[
          btn(t("approve"), async function(){ await sb.from("plans").update({ status:"approved", approved_at:new Date().toISOString(), approved_by:STATE.user.id }).eq("id", pl.id); await sb.from("profiles").update({ first_plan_approved:true }).eq("user_id", pl.user_id); }),
          btn(t("reject"), function(){ return sb.from("plans").update({ status:"rejected" }).eq("id", pl.id); }, "ghost")]));
      });
    })(plans[i]);
  }
  section("admPlans", t("admPlans"), plans.length ? pbox : null);

  var pays = (await sb.from("payments").select("*").eq("status","reported").order("created_at")).data || [];
  section("admPays", t("admPays"), pays.length ? table(["", "", "", "", ""], pays.map(function(x){
    return [x.created_at.slice(0,10), name[x.user_id] || "", "US$" + x.amount + ", " + x.months + " mo, " + (x.method === "benefitpay" ? "BenefitPay" : "bank"), x.reference,
      el("div",{cls:"ck-cta"},[btn(t("confirm"), function(){ return sb.from("payments").update({ status:"confirmed" }).eq("id", x.id); }), btn(t("notFound"), function(){ return sb.from("payments").update({ status:"rejected" }).eq("id", x.id); }, "ghost")])];
  })) : null);

  var cl = (await sb.from("clearances").select("*").is("reviewed_at", null).order("created_at")).data || [];
  section("admClear", t("admClear"), cl.length ? table(["", "", ""], cl.map(function(c){
    return [c.created_at.slice(0,10), name[c.user_id] || "", btn(t("reactivate"), async function(){
      await sb.from("clearances").update({ reviewed_at:new Date().toISOString() }).eq("id", c.id);
      await sb.from("profiles").update({ status:"active", pause_reason:null }).eq("user_id", c.user_id);
      await sb.from("flags").update({ resolved_at:new Date().toISOString(), resolution:"cleared by doctor" }).eq("user_id", c.user_id).is("resolved_at", null);
    })];
  })) : null);

  section("admAthletes", t("admAth") + " (" + people.length + ")", people.length ? table(["", "", "", "", ""], people.map(function(p){
    return [p.full_name, p.status + (p.pause_reason ? " (" + p.pause_reason + ")" : ""), p.paid_until || "", (p.race_distance || "") + " " + (p.race_date || ""), p.intervals_connected_at ? "Intervals.icu" : ""];
  })) : null);
}

/* ---------- start ---------- */
if(!LIVE) $("previewBar").hidden = false;
applyI18n();
loadUser().then(function(){
  if(LINK_ERR){ go("signin", true); banner(t("eLinkOld"), true); history.replaceState(null, "", location.pathname + "#signin"); return; }
  if(RECOVERY){ showReset(); return; }
  var h = (location.hash || "#overview").slice(1).split(/[#&]/)[0];
  go(h || "overview", /access_token|error=/.test(location.hash) ? true : false);
});

/* ---------- zones, estimates, race plans, fitness results and sweat rate (added 11 November 2026) ---------- */
function L(en, ar){ return LANG === "ar" ? ar : en; }
function mmss(sec){ sec = Math.round(sec); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), x = sec % 60; return (h ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(x).padStart(2, "0"); }
function rangeTxt(r, fmt){ if(!r) return ""; var a = r[0], b = r[1]; fmt = fmt || String; if(a == null) return L("under ", "أقل من ") + fmt(b); if(b == null) return fmt(a) + "+"; return fmt(a) + L(" to ", " إلى ") + fmt(b); }
function paceTxt(r){ if(!r) return ""; var f = r[0], w = r[1]; if(w == null) return L("slower than ", "أبطأ من ") + mmss(f); if(f == null) return L("faster than ", "أسرع من ") + mmss(w); return mmss(f) + L(" to ", " إلى ") + mmss(w); }
function zoneHint(sport, zone){
  var z = (STATE.profile || {}).zones; if(!z || !zone) return "";
  var i = zone - 1, out = [];
  if(sport === "run" && z.run){ if(z.run.hr) out.push(rangeTxt(z.run.hr[i]) + L(" bpm", " نبضة")); if(z.run.pace) out.push(paceTxt(z.run.pace[i]) + L(" per km", " لكل كم")); }
  if(sport === "bike" && z.bike){ if(z.bike.power) out.push(rangeTxt(z.bike.power[i]) + " W"); else if(z.bike.hr) out.push(rangeTxt(z.bike.hr[i]) + L(" bpm", " نبضة")); }
  if(sport === "swim" && z.swim && z.swim.pace) out.push(paceTxt(z.swim.pace[i]) + L(" per 100 m", " لكل 100 م"));
  return out.length ? " (" + out.join(sep()) + ")" : "";
}
async function drawPrediction(){
  var c = $("predCard"); c.hidden = true; c.innerHTML = "";
  if(!sb || !STATE.user) return;
  var pr = (await sb.from("predictions").select("*").eq("user_id", STATE.user.id).maybeSingle()).data;
  c.hidden = true; c.innerHTML = "";
  if(!pr) return;
  c.appendChild(el("p",{cls:"micro", text:L("Race time estimate", "الزمن المتوقع للسباق")}));
  if(pr.mid_s){
    c.appendChild(el("h3",{dir:"ltr", text:mmss(pr.low_s) + " to " + mmss(pr.high_s)}));
    c.appendChild(el("p",{text:L("An estimate from your recent results and training, not a target. It assumes a cool, flat course.", "تقدير مبني على نتائجك وتدريبك الأخير، وليس هدفا، ويفترض مسارا مستويا وجوا معتدلا.")}));
    if(pr.heat_low_s) c.appendChild(el("p",{text:L("With the race-day forecast (WBGT about " + pr.heat_wbgt + " degrees): " + mmss(pr.heat_low_s) + " to " + mmss(pr.heat_high_s) + ".", "مع توقعات طقس يوم السباق (مؤشر الحرارة الرطبة حوالي " + pr.heat_wbgt + " درجة): من " + mmss(pr.heat_low_s) + " إلى " + mmss(pr.heat_high_s) + ".")}));
    var h = (pr.history || []).slice(-8);
    if(h.length > 1) c.appendChild(el("p",{cls:"note", dir:"ltr", text:h.map(function(x){ return x.day.slice(5) + " " + mmss(x.mid_s); }).join("   ")}));
  } else {
    var why = {triathlon:L("There is no finish time estimate for triathlon, because no tested method predicts it well. Your race plan gives targets for each discipline instead.", "لا نقدم زمنا متوقعا للترايثلون لعدم وجود طريقة مجربة تتنبأ به بدقة، وتعطيك خطة السباق أهدافا لكل رياضة بدلا من ذلك."), result:L("Add a race from the last eight weeks or a 30 minute running test in your profile to see an estimate.", "أضف سباقا من الأسابيع الثمانية الأخيرة أو اختبار جري لمدة 30 دقيقة في ملفك لترى التقدير."), four_weeks:L("A marathon estimate needs four weeks of training data. It will appear once that is in.", "يحتاج تقدير الماراثون إلى أربعة أسابيع من بيانات التدريب، وسيظهر عند توفرها.")}[pr.missing];
    if(!why) return;
    c.appendChild(el("p",{text:why}));
  }
  c.hidden = false;
}
async function latestRacePlan(){
  if(!sb || !STATE.user) return null;
  var r = (await sb.from("race_plans").select("*").eq("user_id", STATE.user.id).gte("race_date", todayStr()).order("created_at",{ascending:false}).limit(1)).data;
  return r && r[0] ? r[0] : null;
}
async function drawRacePlanCard(){
  var c = $("rpCard"); c.hidden = true; c.innerHTML = "";
  var rp = await latestRacePlan(); c.hidden = true; c.innerHTML = ""; if(!rp) return;
  c.appendChild(el("p",{cls:"micro", text:L("Your race plan is ready", "خطة سباقك جاهزة")}));
  var a = el("a",{href:"#raceplan", "data-go":"raceplan", cls:"btn small", text:L("Open the race plan", "افتح خطة السباق")});
  c.appendChild(el("div",{cls:"ck-cta"},[a])); c.hidden = false;
}
async function renderRacePlan(){
  var b = $("rpBody");
  var rp = await latestRacePlan();
  b.innerHTML = "";
  if(!rp){ $("rpH").textContent = L("No race plan yet", "لا توجد خطة سباق بعد"); b.appendChild(el("p",{cls:"lead", text:L("Your race plan appears here two weeks before your race, and is updated three days before with the latest forecast.", "تظهر خطة سباقك هنا قبل السباق بأسبوعين، وتُحدث قبله بثلاثة أيام بآخر توقعات الطقس.")})); return; }
  $("rpH").textContent = L("Race day, ", "يوم السباق، ") + fmtDate(rp.race_date);
  var lines = (LANG === "ar" ? rp.content.ar : rp.content.en) || [];
  var card = el("div",{cls:"card"}); lines.forEach(function(l){ card.appendChild(el("p",{text:l})); }); b.appendChild(card);
}
var FIT_FIELDS = {
  run_test:[["hr_last20", "Average heart rate, last 20 minutes", "متوسط النبض في آخر 20 دقيقة", 80, 220], ["distance_m", "Distance covered in 30 minutes (meters)", "المسافة المقطوعة في 30 دقيقة (متر)", 2000, 12000]],
  race:[["distance_km", "Race distance (km)", "مسافة السباق (كم)", 3, 42.2], ["time_hms", "Finish time (h:mm:ss)", "زمن الوصول (س:دد:ثث)", null, null]],
  bike_power_test:[["avg_power_20", "Average power over 20 minutes (watts)", "متوسط القدرة خلال 20 دقيقة (واط)", 50, 600]],
  bike_hr_test:[["hr_last20", "Average heart rate, last 20 minutes", "متوسط النبض في آخر 20 دقيقة", 80, 220]],
  swim_css:[["t400", "400 m time (m:ss)", "زمن 400 م (د:ثث)", null, null], ["t200", "200 m time (m:ss)", "زمن 200 م (د:ثث)", null, null]]
};
function toSec(v){ var p = String(v || "").trim().split(":").map(Number); if(p.some(isNaN) || !p.length) return null; return p.reduce(function(a, x){ return a * 60 + x; }, 0); }
function fitFields(){
  var k = $("f-kind").value, box = $("f-fields"); box.innerHTML = "";
  (FIT_FIELDS[k] || []).forEach(function(f){
    var inp = el("input",{cls:"in", id:"ff-" + f[0], dir:"ltr", inputmode: f[3] == null ? "text" : "decimal"});
    box.appendChild(el("div",{cls:"field"},[el("label",{for:"ff-" + f[0], text:L(f[1], f[2])}), inp]));
  });
}
$("f-kind").addEventListener("change", fitFields);
async function drawFitness(){
  if(!$("f-day").value) $("f-day").value = todayStr();
  fitFields();
  var zv = $("zonesView"), z = (STATE.profile || {}).zones; zv.innerHTML = "";
  if(z){
    var ul = el("ul",{cls:"files"});
    if(z.run){ ul.appendChild(el("li",{},[el("span",{text:L("Running threshold", "عتبة الجري") + ": " + (z.run.lthr ? z.run.lthr + L(" bpm", " نبضة") + sep() : "") + mmss(z.run.threshold_pace_s_km) + L(" per km", " لكل كم")}), el("span",{cls:"attrib", text:z.run.day})])); }
    if(z.bike){ ul.appendChild(el("li",{},[el("span",{text:L("Cycling threshold", "عتبة الدراجة") + ": " + (z.bike.ftp ? z.bike.ftp + " W" : "") + (z.bike.ftp && z.bike.lthr ? sep() : "") + (z.bike.lthr ? z.bike.lthr + L(" bpm", " نبضة") : "")}), el("span",{cls:"attrib", text:z.bike.day || z.bike.day_hr || ""})])); }
    if(z.swim){ ul.appendChild(el("li",{},[el("span",{text:L("Swim threshold (CSS)", "عتبة السباحة") + ": " + mmss(z.swim.css_s_100m) + L(" per 100 m", " لكل 100 م")}), el("span",{cls:"attrib", text:z.swim.day})])); }
    zv.appendChild(ul);
    zv.appendChild(el("p",{cls:"note", text:L("Zones 1 and 2 are easy, zone 3 is tempo to threshold, zones 4 and 5 are hard intervals. The ranges show next to each step of your sessions.", "المنطقتان 1 و2 سهلتان، والمنطقة 3 من الإيقاع المتوسط حتى العتبة، والمنطقتان 4 و5 فترات صعبة. تظهر النطاقات بجانب كل خطوة في حصصك.")}));
  }
  var list = $("fitList"); list.innerHTML = "";
  if(!sb || !STATE.user) return;
  var rs = (await sb.from("fitness_results").select("id,day,kind,data").eq("user_id", STATE.user.id).order("day",{ascending:false}).limit(10)).data || [];
  list.innerHTML = "";
  var names = {}; t("opts").fitkind.forEach(function(o){ names[o[0]] = o[1]; });
  rs.forEach(function(r){
    var del = el("button",{cls:"btn ghost small", type:"button", text:L("Delete", "حذف")});
    del.addEventListener("click", async function(){ if(!confirm(L("Delete this result?", "هل تريد حذف هذه النتيجة؟"))) return; await sb.from("fitness_results").delete().eq("id", r.id); drawFitness(); });
    list.appendChild(el("li",{},[el("span",{text:r.day + sep() + (names[r.kind] || r.kind)}), del]));
  });
}
$("fitForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("fitErr");
  var k = $("f-kind").value, day = $("f-day").value, data = {};
  if(!day || day > todayStr() || day < addDays(todayStr(), -42)) return err("fitErr", L("Use a date within the last six weeks.", "استخدم تاريخا ضمن الأسابيع الستة الأخيرة."));
  var bad = false;
  (FIT_FIELDS[k] || []).forEach(function(f){
    var v = $("ff-" + f[0]).value.trim();
    if(f[3] == null){ var sec = toSec(v); if(!sec) bad = true; data[f[0]] = sec; }
    else { var n = Number(v); if(!v || isNaN(n) || n < f[3] || n > f[4]) bad = true; data[f[0]] = n; }
  });
  if(bad) return err("fitErr", L("Check the numbers; one of them is missing or out of range.", "راجع الأرقام، فأحدها ناقص أو خارج النطاق."));
  if(k === "race"){ data = { distance_m: Math.round(data.distance_km * 1000), time_s: data.time_hms }; }
  if(k === "swim_css"){ data = { t400_s: data.t400, t200_s: data.t200 }; if(data.t400_s <= data.t200_s) return err("fitErr", L("The 400 m time must be longer than the 200 m time.", "يجب أن يكون زمن 400 م أطول من زمن 200 م.")); }
  if(!sb){ banner(t("ePreview")); return; }
  var r = await sb.from("fitness_results").insert({ user_id:STATE.user.id, day:day, kind:k, data:data });
  if(r.error) return err("fitErr", t("eNet"));
  banner(L("Saved. Your zones update within the hour.", "تم الحفظ. تتحدث مناطقك خلال ساعة."));
  drawFitness();
});
function sweatCalc(){
  var b = Number($("sw-before").value), a = Number($("sw-after").value), d = Number($("sw-drink").value || 0), u = Number($("sw-urine").value || 0), m = Number($("sw-min").value);
  if(!b || !a || !m || b < 30 || a < 30 || m < 30) return null;
  var lph = ((b - a) + d / 1000 - u / 1000) / (m / 60);
  return lph > 0 && lph < 5 ? Math.round(lph * 100) / 100 : null;
}
["sw-before","sw-after","sw-drink","sw-urine","sw-min"].forEach(function(id){ $(id).addEventListener("input", function(){ var v = sweatCalc(); $("sweatNow").textContent = v ? L("Sweat rate: " + v + " liters an hour.", "معدل التعرق: " + v + " لتر في الساعة.") : ""; }); });
function drawSweat(){
  var p = STATE.profile || {};
  $("sweatNow").textContent = p.sweat_rate_lph ? L("Saved: " + p.sweat_rate_lph + " liters an hour, measured " + (p.sweat_day || "") + ".", "المحفوظ: " + p.sweat_rate_lph + " لتر في الساعة، بتاريخ " + (p.sweat_day || "") + ".") : "";
}
$("sweatForm").addEventListener("submit", async function(e){
  e.preventDefault(); err("sweatErr");
  var v = sweatCalc();
  if(!v) return err("sweatErr", L("Check the numbers; the result does not look possible.", "راجع الأرقام، فالنتيجة لا تبدو ممكنة."));
  if(!sb){ banner(t("ePreview")); return; }
  var r = await sb.from("profiles").update({ sweat_rate_lph:v, sweat_mass_kg:Number($("sw-before").value), sweat_day:todayStr() }).eq("user_id", STATE.user.id);
  if(r.error) return err("sweatErr", t("eNet"));
  await loadUser(); drawSweat(); banner(L("Sweat rate saved.", "تم حفظ معدل التعرق."));
});

/* ---------- standard website fixes, 12 November 2026 ---------- */
async function resendConfirm(email, outEl, errId){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")){ if(errId) err(errId, t("eEmail")); else if(outEl){ outEl.textContent = t("eEmail"); outEl.classList.add("on"); } return; }
  if(!sb){ if(outEl){ outEl.textContent = t("ePreview"); outEl.classList.add("on"); } return; }
  var r = await sb.auth.resend({ type:"signup", email:email, options:{ emailRedirectTo: location.origin + location.pathname } });
  var msg = r.error
    ? (/rate|seconds|too many/i.test(r.error.message || "") ? L("Please wait a minute before asking for another email.", "يرجى الانتظار دقيقة قبل طلب رسالة أخرى.") : L("The email could not be sent. Please try again in a few minutes, or write to contact@arabianmethod.com.", "تعذر إرسال الرسالة. حاول مرة أخرى بعد دقائق، أو راسلنا على contact@arabianmethod.com."))
    : L("We have sent the confirmation email again to " + email + ". Check your spam or junk folder if it is not in your inbox.", "أعدنا إرسال رسالة التأكيد إلى " + email + ". راجع مجلد البريد غير المرغوب فيه إن لم تجدها في صندوق الوارد.");
  if(errId && r.error){ err(errId, msg); return; }
  if(outEl){ outEl.textContent = msg; outEl.classList.add("on"); outEl.hidden = false; }
}
$("regResend").addEventListener("click", function(){ resendConfirm(window.__regEmail, $("regResendOk")); });
$("siResend").addEventListener("click", function(){
  err("signErr"); var m = $("s-email").value.trim();
  if(!m){ err("signErr", L("Type the email address you registered with in the Email box, then press Send it again.", "اكتب البريد الإلكتروني الذي سجّلت به في خانة البريد، ثم اضغط أعد إرسالها.")); return; }
  resendConfirm(m, $("signOk"), "signErr").then(function(){ if($("signOk").textContent) ok("signOk"); });
});

/* show password buttons */
(function(){
  var eye = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var eyeOff = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.8-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  document.querySelectorAll('input[type="password"]').forEach(function(inp){
    var w = document.createElement("span"); w.className = "pw-wrap";
    inp.parentNode.insertBefore(w, inp); w.appendChild(inp);
    var b = document.createElement("button"); b.type = "button"; b.className = "pw-eye"; b.innerHTML = eye;
    var label = function(){ var shown = inp.type === "text"; b.setAttribute("aria-label", shown ? L("Hide password", "إخفاء كلمة المرور") : L("Show password", "إظهار كلمة المرور")); b.setAttribute("aria-pressed", shown ? "true" : "false"); };
    label();
    b.addEventListener("click", function(){ inp.type = inp.type === "password" ? "text" : "password"; b.innerHTML = inp.type === "text" ? eyeOff : eye; label(); inp.focus(); });
    w.appendChild(b);
    inp.form && inp.form.addEventListener("submit", function(){ inp.type = "password"; b.innerHTML = eye; label(); });
  });
})();

/* phone tabs: fade the edge only while there are more tabs to swipe to */
(function(){
  var tabs = $("tabs"); if(!tabs) return;
  var upd = function(){
    var max = tabs.scrollWidth - tabs.clientWidth;
    var pos = Math.abs(tabs.scrollLeft);
    tabs.classList.toggle("more", max > 4 && pos < max - 4);
  };
  window.__tabsMore = upd;
  tabs.addEventListener("scroll", upd, { passive:true });
  window.addEventListener("resize", upd);
  setTimeout(upd, 300);
})();

})();
