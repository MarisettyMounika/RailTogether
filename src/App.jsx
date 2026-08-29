import { useState } from 'react'
import { getSyntheticSeatsForTrain, optimizeSeats } from './lib/seatOptimizer'

const benefits = [
  { icon: '♟', title: 'Groups of any size', text: 'Coordinate every traveller, even when bookings are split.' },
  { icon: '⌘', title: 'Smart seat coordination', text: 'Plan seating preferences as one group.' },
  { icon: '◎', title: 'One place for your journey', text: 'Keep your group journey organised from start to finish.' },
]

const demoTravellers = [
  { id: 1, name: 'Ravi Kumar', type: 'Adult', group: 'Family A' },
  { id: 2, name: 'Sita Kumar', type: 'Adult', group: 'Family A' },
  { id: 3, name: 'Ananya Kumar', type: 'Child', group: 'Family A' },
  { id: 4, name: 'Arjun Kumar', type: 'Adult', group: 'Family A' },
  { id: 5, name: 'Rajesh Rao', type: 'Adult', group: 'Family B' },
  { id: 6, name: 'Lakshmi Rao', type: 'Senior', group: 'Family B' },
  { id: 7, name: 'Priya Rao', type: 'Adult', group: 'Family B' },
  { id: 8, name: 'Kiran Rao', type: 'Child', group: 'Family B' },
  { id: 9, name: 'Neha Sharma', type: 'Adult', group: 'Friends' },
  { id: 10, name: 'Rahul Sharma', type: 'Adult', group: 'Friends' },
  { id: 11, name: 'Akash Verma', type: 'Adult', group: 'Friends' },
  { id: 12, name: 'Sneha Verma', type: 'Adult', group: 'Friends' },
]

const getDemoTravellers = (count) => demoTravellers.slice(0, count)

function Brand() {
  return (
    <div className="flex items-center gap-2.5" aria-label="RailTogether">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-rail-700 text-xl text-white shadow-sm" aria-hidden="true">↔</span>
      <span className="text-lg font-bold tracking-tight text-rail-900">RailTogether</span>
    </div>
  )
}

function Home({ onStart }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-5 sm:px-7">
      <header><Brand /></header>
      <section className="flex flex-1 flex-col justify-center py-12">
        <p className="mb-4 inline-flex w-fit rounded-full bg-rail-100 px-3 py-1.5 text-xs font-semibold text-rail-700">SIMULATED HACKATHON PROTOTYPE</p>
        <h1 className="max-w-md text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">Your group. One journey. Together.</h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-600">When a larger group must book in batches, keeping everyone coordinated can be hard. RailTogether helps your group plan the journey and find a better seat arrangement using simulated data.</p>
        <button onClick={onStart} className="focus-ring mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-rail-700 px-5 text-base font-bold text-white shadow-soft transition hover:bg-rail-900 active:scale-[0.99] sm:w-auto sm:self-start">Plan a Group Journey <span className="ml-2 text-xl" aria-hidden="true">→</span></button>
      </section>
      <section aria-label="RailTogether benefits" className="grid gap-3 pb-8">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rail-50 text-lg text-rail-700" aria-hidden="true">{benefit.icon}</span>
            <div><h2 className="font-bold text-slate-800">{benefit.title}</h2><p className="mt-0.5 text-sm leading-5 text-slate-500">{benefit.text}</p></div>
          </article>
        ))}
      </section>
      <footer className="border-t border-stone-200 pt-5 text-center text-xs leading-5 text-slate-500">Hackathon prototype • Uses synthetic data • Not affiliated with IRCTC or Indian Railways</footer>
    </main>
  )
}

function TravellerStepper({ value, onChange }) {
  return <div className="flex items-center rounded-xl border border-stone-300 bg-white" aria-label="Number of travellers">
    <button type="button" aria-label="Remove traveller" onClick={() => onChange(Math.max(1, value - 1))} className="focus-ring grid h-12 w-12 place-items-center rounded-l-xl text-2xl text-rail-700 hover:bg-rail-50 disabled:text-slate-300" disabled={value <= 1}>−</button>
    <output className="min-w-10 text-center text-lg font-bold text-slate-900" aria-live="polite">{value}</output>
    <button type="button" aria-label="Add traveller" onClick={() => onChange(value + 1)} className="focus-ring grid h-12 w-12 place-items-center rounded-r-xl text-2xl text-rail-700 hover:bg-rail-50">+</button>
  </div>
}

function JourneyDetails({ onContinue }) {
  const [travellers, setTravellers] = useState(6)
  const [form, setForm] = useState({ from: '', to: '', date: '' })
  const [journeyError, setJourneyError] = useState('')
  const [dateError, setDateError] = useState('')
  const today = new Date()
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  const update = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
    if (field === 'from' || field === 'to') setJourneyError('')
    if (field === 'date') setDateError('')
  }
  const submit = (event) => {
    event.preventDefault()
    const from = form.from.trim()
    const to = form.to.trim()
    if (!from || !to) {
      setJourneyError('Please enter both departure and destination.')
      return
    }
    if (from.toLocaleLowerCase() === to.toLocaleLowerCase()) {
      setJourneyError('Departure and destination must be different.')
      return
    }
    if (!form.date) {
      setDateError('Please select a travel date.')
      return
    }
    if (form.date && form.date < localToday) {
      setDateError('Please select a future travel date.')
      return
    }
    onContinue({ from, to, travellers })
  }
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-5 sm:px-7">
      <header className="flex items-center justify-between"><Brand /><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Simulated</span></header>
      <section className="pt-12 pb-8">
        <p className="text-sm font-bold text-rail-700">STEP 1 OF 6</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Plan your journey</h1>
        <p className="mt-3 text-base leading-6 text-slate-600">Start with the basics. You can add people and choose preferences next.</p>
      </section>
      <form onSubmit={submit} className="space-y-5" noValidate>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">From station</span><input required value={form.from} onChange={update('from')} placeholder="e.g. New Delhi (NDLS)" className="focus-ring min-h-14 w-full rounded-xl border border-stone-300 bg-white px-4 text-base placeholder:text-slate-400" /></label>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">To station</span><input required value={form.to} onChange={update('to')} placeholder="e.g. Mumbai Central (MMCT)" aria-invalid={Boolean(journeyError)} aria-describedby={journeyError ? 'journey-error' : undefined} className="focus-ring min-h-14 w-full rounded-xl border border-stone-300 bg-white px-4 text-base placeholder:text-slate-400" />{journeyError && <p id="journey-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{journeyError}</p>}</label>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Journey date</span><input required type="date" min={localToday} value={form.date} onChange={update('date')} aria-invalid={Boolean(dateError)} aria-describedby={dateError ? 'journey-date-error' : undefined} className={`focus-ring min-h-14 w-full rounded-xl border bg-white px-4 text-base ${dateError ? 'border-red-500' : 'border-stone-300'}`} />{dateError && <p id="journey-date-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{dateError}</p>}</label>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4"><div><label htmlFor="travellers" className="block text-sm font-bold text-slate-700">Number of travellers</label><p className="mt-1 text-sm text-slate-500">Include everyone in your group</p></div><TravellerStepper value={travellers} onChange={setTravellers} /></div>
        {travellers > 6 && <div role="status" className="rounded-2xl border border-rail-100 bg-rail-50 p-4 text-sm leading-6 text-rail-900"><span className="mr-2 font-bold" aria-hidden="true">✦</span>Your group has more than 6 travellers. We'll help coordinate your bookings so your group can stay together as much as possible.</div>}
        <button type="submit" className="focus-ring flex min-h-14 w-full items-center justify-center rounded-2xl bg-rail-700 px-5 text-base font-bold text-white shadow-soft transition hover:bg-rail-900 active:scale-[0.99]">Continue <span className="ml-2 text-xl" aria-hidden="true">→</span></button>
      </form>
      <footer className="mt-10 border-t border-stone-200 pt-5 text-center text-xs leading-5 text-slate-500">Hackathon prototype • Uses synthetic data • Not affiliated with IRCTC or Indian Railways</footer>
    </main>
  )
}

function Travellers({ journey, onPreferences, initialTravellers, targetTravellerCount }) {
  const [travellers, setTravellers] = useState(initialTravellers)
  const [showForm, setShowForm] = useState(false)
  const [newTraveller, setNewTraveller] = useState({ name: '', age: '', type: 'Adult', group: '' })
  const [nextId, setNextId] = useState(initialTravellers.length + 1)
  const [travellerError, setTravellerError] = useState('')
  const canAddTraveller = travellers.length < targetTravellerCount

  const updateNewTraveller = (field) => (event) => setNewTraveller({ ...newTraveller, [field]: event.target.value })
  const addTraveller = (event) => {
    event.preventDefault()
    if (!canAddTraveller) return
    if (!newTraveller.name.trim() || !newTraveller.age || !newTraveller.group.trim()) return
    setTravellers([...travellers, { id: nextId, name: newTraveller.name.trim(), type: newTraveller.type, group: newTraveller.group.trim() }])
    setNextId(nextId + 1)
    setNewTraveller({ name: '', age: '', type: 'Adult', group: '' })
    setShowForm(false)
    setTravellerError('')
  }
  const continueToPreferences = () => {
    if (travellers.length !== targetTravellerCount) {
      setTravellerError(`Please add all ${targetTravellerCount} travellers before continuing.`)
      return
    }
    onPreferences(travellers)
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-5 sm:px-7">
      <header className="flex items-center justify-between"><Brand /><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Simulated</span></header>
      <section className="pt-10 pb-6">
        <p className="text-sm font-bold text-rail-700">STEP 2 OF 6</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Who's travelling?</h1>
        <p className="mt-3 text-base leading-6 text-slate-600">Add everyone in your group. We'll use this information to create the best possible seating arrangement.</p>
      </section>

      <section aria-label="Journey summary" className="rounded-2xl border border-rail-100 bg-rail-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-rail-700">Your journey · demo data</p>
        <p className="mt-2 font-bold text-slate-900">{journey.from} <span className="px-1 text-rail-700" aria-hidden="true">→</span> {journey.to}</p>
        <p className="mt-1 text-sm text-slate-600">15 September 2026 <span className="px-1" aria-hidden="true">•</span> {travellers.length} travellers</p>
      </section>

      <section className="pt-7" aria-labelledby="traveller-list-heading">
        <div className="flex items-center justify-between gap-3">
          <div><h2 id="traveller-list-heading" className="text-lg font-extrabold text-slate-900">Travellers</h2><p className="mt-1 text-sm text-slate-500">All names shown are synthetic demo data.</p></div>
          <output className="shrink-0 rounded-full bg-rail-100 px-3 py-1.5 text-sm font-bold text-rail-900" aria-live="polite">{travellers.length} / {targetTravellerCount} travellers added ✓</output>
        </div>
        <div className="mt-4 grid gap-3">
          {travellers.map((traveller) => (
            <article key={traveller.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rail-50 font-bold text-rail-700" aria-hidden="true">{traveller.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}</span>
              <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-slate-800">{traveller.name}</h3><p className="mt-1 text-sm text-slate-500">{traveller.type} <span aria-hidden="true">•</span> {traveller.group}</p></div>
              <button type="button" onClick={() => setTravellers(travellers.filter((person) => person.id !== traveller.id))} className="focus-ring rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${traveller.name}`}>Remove</button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <button type="button" disabled={!canAddTraveller} onClick={() => setShowForm(!showForm)} aria-expanded={canAddTraveller && showForm} className="focus-ring flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-dashed border-rail-500 bg-white px-4 font-bold text-rail-700 hover:bg-rail-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-slate-400">+ Add traveller</button>
        {canAddTraveller && showForm && <form onSubmit={addTraveller} className="mt-3 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-800">Add synthetic demo traveller</p>
          <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Name</span><input required value={newTraveller.name} onChange={updateNewTraveller('name')} placeholder="e.g. Dev Singh" className="focus-ring min-h-12 w-full rounded-xl border border-stone-300 px-3 placeholder:text-slate-400" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Age</span><input required min="0" max="120" type="number" inputMode="numeric" value={newTraveller.age} onChange={updateNewTraveller('age')} placeholder="e.g. 32" className="focus-ring min-h-12 w-full rounded-xl border border-stone-300 px-3 placeholder:text-slate-400" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Passenger type</span><select value={newTraveller.type} onChange={updateNewTraveller('type')} className="focus-ring min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3"><option>Adult</option><option>Child</option><option>Senior</option></select></label>
          <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Family/group</span><input required value={newTraveller.group} onChange={updateNewTraveller('group')} placeholder="e.g. Friends" className="focus-ring min-h-12 w-full rounded-xl border border-stone-300 px-3 placeholder:text-slate-400" /></label>
          <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="focus-ring min-h-12 flex-1 rounded-xl border border-stone-300 px-4 font-bold text-slate-700 hover:bg-stone-50">Cancel</button><button type="submit" className="focus-ring min-h-12 flex-1 rounded-xl bg-rail-700 px-4 font-bold text-white hover:bg-rail-900">Add traveller</button></div>
        </form>}
      </section>

      <section className="mt-8 space-y-3"><p className="rounded-xl bg-amber-50 p-3 text-center text-xs leading-5 text-amber-900">Demo data only — no real passenger information is used.</p>{travellerError && <p role="alert" className="text-center text-sm font-semibold text-red-700">{travellerError}</p>}<button type="button" onClick={continueToPreferences} className="focus-ring flex min-h-14 w-full items-center justify-center rounded-2xl bg-rail-700 px-5 text-base font-bold text-white shadow-soft transition hover:bg-rail-900 active:scale-[0.99]">Set Group Preferences <span className="ml-2 text-xl" aria-hidden="true">→</span></button></section>
      <footer className="mt-10 border-t border-stone-200 pt-5 text-center text-xs leading-5 text-slate-500">Hackathon prototype • Uses synthetic data • Not affiliated with IRCTC or Indian Railways</footer>
    </main>
  )
}

const preferenceDetails = [
  { id: 'sameCoach', title: 'Same coach', description: 'Keep as many group members as possible in one coach.' },
  { id: 'familiesTogether', title: 'Families together', description: 'Keep members of the same family close to each other.' },
  { id: 'childrenNearFamily', title: 'Children near family', description: 'Prioritize seating children close to their family members.' },
  { id: 'seniorsNearFamily', title: 'Seniors near family', description: 'Keep senior travellers close to their family.' },
]

function Toggle({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`focus-ring relative h-8 w-14 shrink-0 rounded-full transition ${checked ? 'bg-rail-700' : 'bg-slate-300'}`}>
    <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
}

function GroupPreferences({ onFindArrangement, initialPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [priority, setPriority] = useState(initialPreferences.priority === 'same coach' ? 'Everyone in the same coach' : initialPreferences.priority === 'closest seats' ? 'Closest possible seats' : 'Families together')
  const [loadingStep, setLoadingStep] = useState(null)
  const loadingMessages = ['Finding the best group arrangement...', 'Checking available seats...', 'Optimizing group proximity...']

  const startFinding = () => {
    setLoadingStep(0)
    window.setTimeout(() => setLoadingStep(1), 700)
    window.setTimeout(() => setLoadingStep(2), 1400)
    window.setTimeout(() => onFindArrangement({ ...preferences, priority: priority === 'Everyone in the same coach' ? 'same coach' : priority === 'Closest possible seats' ? 'closest seats' : 'families together' }), 2200)
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-5 sm:px-7">
      <header className="flex items-center justify-between"><Brand /><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Simulated</span></header>
      <section className="pt-10 pb-7">
        <p className="text-sm font-bold text-rail-700">STEP 3 OF 6</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">How should we keep your group together?</h1>
        <p className="mt-3 text-base leading-6 text-slate-600">We'll prioritize these preferences when creating your group arrangement.</p>
      </section>

      <section aria-label="Group preferences" className="grid gap-3">
        {preferenceDetails.map((preference) => (
          <article key={preference.id} className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex-1"><h2 className="font-bold text-slate-800">{preference.title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{preference.description}</p></div>
            <Toggle label={preference.title} checked={preferences[preference.id]} onChange={() => setPreferences({ ...preferences, [preference.id]: !preferences[preference.id] })} />
          </article>
        ))}
      </section>

      <section className="mt-8" aria-labelledby="priority-heading">
        <h2 id="priority-heading" className="text-lg font-extrabold text-slate-900">What's most important?</h2>
        <div className="mt-3 grid gap-3" role="radiogroup" aria-labelledby="priority-heading">
          {['Everyone in the same coach', 'Families together', 'Closest possible seats'].map((option) => {
            const selected = priority === option
            return <button key={option} type="button" role="radio" aria-checked={selected} onClick={() => setPriority(option)} className={`focus-ring flex min-h-14 items-center justify-between rounded-2xl border p-4 text-left transition ${selected ? 'border-rail-600 bg-rail-50 text-rail-900' : 'border-stone-200 bg-white text-slate-700 hover:border-rail-500'}`}><span className="font-bold">{option}</span><span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${selected ? 'border-rail-700' : 'border-slate-300'}`} aria-hidden="true">{selected && <span className="h-2.5 w-2.5 rounded-full bg-rail-700" />}</span></button>
          })}
        </div>
        <p className="mt-4 rounded-xl bg-stone-100 p-3 text-sm leading-5 text-slate-600">Your preferences help us rank possible seating arrangements. They do not guarantee seat availability.</p>
      </section>

      <section className="mt-8 space-y-3">
        <p className="rounded-xl bg-amber-50 p-3 text-center text-xs leading-5 text-amber-900">Demo prototype — no live railway booking or availability is being accessed.</p>
        {loadingStep !== null && <div className="rounded-2xl border border-rail-100 bg-rail-50 p-4" role="status" aria-live="polite"><p className="font-bold text-rail-900">Finding arrangements using synthetic demo data</p><div className="mt-3 space-y-2 text-sm text-rail-900">{loadingMessages.map((message, index) => <p key={message} className={index <= loadingStep ? 'font-medium' : 'text-rail-900/40'}><span className="mr-2" aria-hidden="true">{index < loadingStep ? '✓' : index === loadingStep ? '◌' : '○'}</span>{message}</p>)}</div></div>}
        <button type="button" onClick={startFinding} disabled={loadingStep !== null} className="focus-ring flex min-h-14 w-full items-center justify-center rounded-2xl bg-rail-700 px-5 text-base font-bold text-white shadow-soft transition hover:bg-rail-900 active:scale-[0.99] disabled:cursor-wait disabled:bg-rail-600">{loadingStep === null ? <>Find the best arrangement <span className="ml-2 text-xl" aria-hidden="true">→</span></> : 'Finding arrangement…'}</button>
      </section>
      <footer className="mt-10 border-t border-stone-200 pt-5 text-center text-xs leading-5 text-slate-500">Hackathon prototype • Uses synthetic data • Not affiliated with IRCTC or Indian Railways</footer>
    </main>
  )
}

const mockTrains = [
  { id: 'vande-bharat', name: 'Vande Bharat', time: '08:00 AM → 01:30 PM', duration: '5h 30m', availability: 'Good', best: true, reason: 'Best match for your preferences. Most passengers can be kept in the same coach, with family members prioritized.' },
  { id: 'intercity-express', name: 'Intercity Express', time: '09:15 AM → 03:00 PM', duration: '5h 45m', availability: 'Limited', best: false, reason: 'Some passengers need to be separated because nearby seats are limited.' },
  { id: 'jan-shatabdi', name: 'Jan Shatabdi', time: '06:30 AM → 12:45 PM', duration: '6h 15m', availability: 'Good', best: false, reason: 'Good group availability, but family clusters are slightly more spread out.' },
]

function TrainSelection({ journey, onSelect, passengers, preferences }) {
  const [optimizing, setOptimizing] = useState(null)
  const trainOptions = mockTrains.map((train) => ({ ...train, result: optimizeSeats({ passengers, preferences, availableSeats: getSyntheticSeatsForTrain(train.id) }) }))
  const chooseTrain = (train) => {
    setOptimizing(train.id)
    window.setTimeout(() => onSelect(train, train.result), 1200)
  }

  return <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-5 sm:px-7">
    <header className="flex items-center justify-between"><Brand /><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Simulated</span></header>
    <section className="pt-10 pb-6"><p className="text-sm font-bold text-rail-700">STEP 4 OF 6</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Choose your journey</h1><p className="mt-3 text-base leading-6 text-slate-600">We've compared the simulated seat availability for your group.</p></section>
    <section aria-label="Journey summary" className="rounded-2xl border border-rail-100 bg-rail-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-rail-700">Synthetic journey data</p><p className="mt-2 font-bold text-slate-900">{journey.from} <span className="px-1 text-rail-700" aria-hidden="true">→</span> {journey.to}</p><p className="mt-1 text-sm text-slate-600">15 September 2026 <span className="px-1" aria-hidden="true">•</span> {passengers.length} travellers</p></section>
    <section className="mt-6 grid gap-4" aria-label="Simulated train choices">
      {trainOptions.map((train) => <article key={train.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${train.best ? 'border-rail-500 ring-2 ring-rail-100' : 'border-stone-200'}`}>
        <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-extrabold text-slate-900">{train.name}</h2>{train.best && <span className="rounded-full bg-rail-700 px-2.5 py-1 text-xs font-bold text-white">Best for your group</span>}</div><p className="mt-2 font-semibold text-slate-700">{train.time}</p><p className="mt-1 text-sm text-slate-500">{train.duration}</p></div><div className="rounded-xl bg-rail-50 px-3 py-2 text-center"><span className="block text-xl font-extrabold text-rail-900">{train.result.compatibilityScore}%</span><span className="block text-[11px] font-bold text-rail-700">GROUP FIT</span></div></div>
        <div className="mt-4 flex items-center gap-2 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${train.availability === 'Good' ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" /><span className="font-bold text-slate-700">Simulated availability:</span><span className="text-slate-600">{train.availability}</span></div><p className="mt-3 text-sm leading-5 text-slate-600">{train.reason}</p>
        <button type="button" disabled={optimizing !== null} onClick={() => chooseTrain(train)} className="focus-ring mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-rail-700 px-4 font-bold text-white transition hover:bg-rail-900 disabled:cursor-wait disabled:bg-rail-600">{optimizing === train.id ? 'Optimizing your group’s seats…' : <>Choose this train <span className="ml-2 text-lg" aria-hidden="true">→</span></>}</button>
      </article>)}
    </section>
    <section className="mt-7 rounded-2xl border border-stone-200 bg-white p-4"><h2 className="font-extrabold text-slate-900">How we calculated this</h2><p className="mt-1 text-sm text-slate-500">These are simulated results for this hackathon prototype.</p><ul className="mt-3 grid gap-2 text-sm text-slate-700">{['Same-coach availability', 'Family proximity', 'Children near family', 'Seniors near family', 'Your selected priority'].map((item) => <li key={item}><span className="mr-2 font-bold text-rail-700" aria-hidden="true">✓</span>{item}</li>)}</ul></section>
    <footer className="mt-10 border-t border-stone-200 pt-5 text-center text-xs leading-5 text-slate-500">Prototype only • Uses synthetic data • No live railway system was accessed</footer>
  </main>
}

function JourneyReady({ journey, train, result, onStartAgain }) {
  const [showWhy, setShowWhy] = useState(false)
  const [showLimited, setShowLimited] = useState(false)
  const seats = result.assignments
  const preferenceSatisfied = (key) => result.scoring.enabledPreferences.includes(key) && result.metrics[key] >= 0.7
  const familiesSatisfied = preferenceSatisfied('familiesTogether')
  const childrenSatisfied = preferenceSatisfied('childrenNearFamily')
  const seniorsSatisfied = preferenceSatisfied('seniorsNearFamily')
  const sameCoachSatisfied = preferenceSatisfied('sameCoach')
  const resultExplanation = familiesSatisfied
    ? result.coachesUsed > 1
      ? 'Your families are kept together, while the remaining travellers are placed in the nearest available coach.'
      : 'Your families are kept together in one simulated coach.'
    : 'Your group is placed as closely as the simulated seat inventory allows.'
  const separationLabel = result.coachesUsed > 1 ? 'Separation minimized' : 'All in one coach'
  return <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-5 sm:px-7">
    <header className="flex items-center justify-between"><Brand /><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Simulated</span></header>
    <section className="pt-10 text-center"><p className="text-sm font-bold text-rail-700">YOUR DEMO PLAN</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Your group journey is ready!</h1><p className="mt-3 text-base font-semibold text-slate-700">{journey.from} <span className="px-1 text-rail-700" aria-hidden="true">→</span> {journey.to}</p><p className="mt-1 text-sm text-slate-500">15 September 2026 <span className="px-1" aria-hidden="true">•</span> {seats.length} travellers <span className="px-1" aria-hidden="true">•</span> {train.name}</p></section>
    <section className="mt-7 rounded-3xl bg-rail-900 p-6 text-center text-white shadow-soft"><p className="text-sm font-bold uppercase tracking-wide text-rail-100">Group compatibility <span className="ml-1 rounded bg-white/15 px-2 py-1 text-[10px]">SIMULATION</span></p><p className="mt-2 text-6xl font-extrabold tracking-tighter">{result.compatibilityScore}%</p><p className="mt-1 text-lg font-bold">Group Compatibility</p><p className="mx-auto mt-4 max-w-sm text-sm leading-5 text-rail-100">{resultExplanation}</p><p className="mt-3 text-xs text-rail-100">Calculated locally from invented seat data and your chosen preferences.</p></section>
    <section aria-label="Arrangement summary" className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm"><p className="text-lg font-extrabold text-slate-900">{seats.length}</p><p className="text-xs font-semibold text-slate-500">travellers</p></div><div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm"><p className="text-lg font-extrabold text-slate-900">{result.coachesUsed}</p><p className="text-xs font-semibold text-slate-500">coaches used</p></div><div className="rounded-xl border border-rail-100 bg-rail-50 p-3 text-center shadow-sm"><p className="text-sm font-extrabold leading-5 text-rail-900">{separationLabel}</p><p className="mt-1 text-xs font-semibold text-rail-700">simulation result</p></div></section>
    <section className="mt-6 rounded-2xl border border-rail-100 bg-rail-50 p-4"><h2 className="font-extrabold text-rail-900">Your preferences, met</h2><ul className="mt-3 grid grid-cols-1 gap-2 text-sm font-medium text-rail-900 sm:grid-cols-2">{result.satisfiedPreferences.map((item) => <li key={item}><span className="mr-2 font-bold" aria-hidden="true">✓</span>{item}</li>)}{result.unmetPreferences.map((item) => <li key={item} className="text-amber-900"><span className="mr-2 font-bold" aria-hidden="true">△</span>{item} not fully met</li>)}</ul></section>
    <section className="mt-6"><h2 className="text-xl font-extrabold text-slate-900">{result.bookingBatchesRequired} coordinated bookings</h2><p className="mt-1 text-sm text-slate-500">SYNTHETIC/DEMO PNRs — not real bookings.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{[{ pnr: 'RT48291', people: '6 travellers' }, { pnr: 'RT48292', people: '6 travellers' }].map((booking, index) => <article key={booking.pnr} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-rail-700">Booking {index + 1} · Demo</p><p className="mt-2 text-lg font-extrabold text-slate-900">{booking.pnr}</p><p className="mt-1 text-sm text-slate-500">{booking.people}</p></article>)}</div></section>
    <section className="mt-7"><div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">Simulated optimized seating arrangement</h2><p className="mt-1 text-sm text-slate-500">{result.coachesUsed} invented coaches used · synthetic passenger placement</p></div><span className="rounded-lg bg-rail-50 px-3 py-2 text-sm font-bold text-rail-700">SIMULATION</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{seats.map((traveller) => <article key={traveller.id} className={`min-h-24 rounded-xl border p-3 ${traveller.group === 'Family A' ? 'border-rail-200 bg-rail-50' : traveller.group === 'Family B' ? 'border-amber-200 bg-amber-50' : 'border-violet-200 bg-violet-50'}`}><p className="text-xs font-bold text-slate-500">{traveller.coach} · SEAT {traveller.seat}</p><p className="mt-2 text-sm font-extrabold text-slate-800">{traveller.name.split(' ')[0]}</p><p className="mt-1 text-xs text-slate-500">{traveller.group}</p></article>)}</div><p className="mt-3 text-xs leading-5 text-slate-500">Seat positions are invented for this prototype and do not reflect live railway availability.</p></section>
    <section className="mt-7 space-y-3"><button type="button" onClick={() => setShowWhy(!showWhy)} aria-expanded={showWhy} className="focus-ring flex min-h-14 w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 text-left font-extrabold text-slate-900 shadow-sm">Why this arrangement?<span className="text-xl text-rail-700" aria-hidden="true">{showWhy ? '−' : '+'}</span></button>{showWhy && <div className="rounded-2xl bg-stone-100 p-4 text-sm leading-6 text-slate-700"><p>{result.explanation}</p><p className="mt-3 font-bold">How the simulated arrangement performed</p><ul className="mt-2 space-y-3"><li><span className={`mr-2 font-bold ${familiesSatisfied ? 'text-rail-700' : 'text-amber-700'}`} aria-hidden="true">{familiesSatisfied ? '✓' : '△'}</span><strong>Families together:</strong> {familiesSatisfied ? 'satisfied' : 'not fully satisfied'}</li><li><span className={`mr-2 font-bold ${childrenSatisfied ? 'text-rail-700' : 'text-amber-700'}`} aria-hidden="true">{childrenSatisfied ? '✓' : '△'}</span><strong>Children near family:</strong> {childrenSatisfied ? 'satisfied' : 'not fully satisfied'}</li><li><span className={`mr-2 font-bold ${seniorsSatisfied ? 'text-rail-700' : 'text-amber-700'}`} aria-hidden="true">{seniorsSatisfied ? '✓' : '△'}</span><strong>Seniors near family:</strong> {seniorsSatisfied ? 'satisfied' : 'not fully satisfied'}</li><li><span className={`mr-2 font-bold ${sameCoachSatisfied ? 'text-rail-700' : 'text-amber-700'}`} aria-hidden="true">{sameCoachSatisfied ? '✓' : '△'}</span><strong>Same coach:</strong> {sameCoachSatisfied ? 'satisfied' : 'not fully satisfied'}{!sameCoachSatisfied && ' — the simulated seat inventory did not provide enough suitable seats in one coach.'}</li></ul><p className="mt-3 text-xs text-slate-500">Selected priority: {result.scoring.priority}. The weights remain transparent and configurable in the local simulation module.</p></div>}</section>
    <section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="font-extrabold text-amber-950">Couldn't keep everyone together?</h2><p className="mt-1 text-sm leading-5 text-amber-900">Explore how RailTogether communicates a limited-seat outcome without making false promises.</p><button type="button" onClick={() => setShowLimited(!showLimited)} aria-expanded={showLimited} className="focus-ring mt-3 min-h-11 rounded-xl border border-amber-300 bg-white px-4 text-sm font-bold text-amber-950 hover:bg-amber-100">See a limited-seat scenario</button>{showLimited && <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-700"><p className="font-bold">10 travellers <span className="px-1" aria-hidden="true">→</span> Coach S4</p><p className="mt-1 font-bold">2 travellers <span className="px-1" aria-hidden="true">→</span> Coach S5</p><p className="mt-3 leading-5">We couldn't find a perfect arrangement in this simulation, so the system minimized separation while preserving your highest-priority preferences.</p></div>}</section>
    <section className="mt-8 space-y-3"><p className="rounded-xl bg-amber-50 p-3 text-center text-xs leading-5 text-amber-900">Prototype only — bookings, PNRs and seat availability are simulated. No live railway system was accessed.</p><button type="button" onClick={onStartAgain} className="focus-ring flex min-h-14 w-full items-center justify-center rounded-2xl bg-rail-700 px-5 text-base font-bold text-white shadow-soft transition hover:bg-rail-900">Start another journey <span className="ml-2 text-xl" aria-hidden="true">→</span></button></section>
    <footer className="mt-10 border-t border-stone-200 pt-5 text-center text-xs leading-5 text-slate-500">Hackathon prototype • Uses synthetic data • Not affiliated with IRCTC or Indian Railways</footer>
  </main>
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [journey, setJourney] = useState({ from: '', to: '' })
  const [journeyTravellers, setJourneyTravellers] = useState(getDemoTravellers(6))
  const [targetTravellerCount, setTargetTravellerCount] = useState(6)
  const [journeyPreferences, setJourneyPreferences] = useState({ sameCoach: true, familiesTogether: true, childrenNearFamily: true, seniorsNearFamily: true, priority: 'families together' })
  if (screen === 'home') return <Home onStart={() => setScreen('journey')} />
  if (screen === 'journey') return <JourneyDetails onContinue={({ from, to, travellers }) => { setJourney({ from, to }); setTargetTravellerCount(travellers); setJourneyTravellers(getDemoTravellers(travellers)); setScreen('travellers') }} />
  if (screen === 'travellers') return <Travellers journey={journey} initialTravellers={journeyTravellers} targetTravellerCount={targetTravellerCount} onPreferences={(travellers) => { setJourneyTravellers(travellers); setScreen('preferences') }} />
  if (screen === 'preferences') return <GroupPreferences initialPreferences={journeyPreferences} onFindArrangement={(preferences) => { setJourneyPreferences(preferences); setScreen('train-selection') }} />
  if (screen === 'train-selection') return <TrainSelection journey={journey} passengers={journeyTravellers} preferences={journeyPreferences} onSelect={(train, result) => { setSelectedTrain(train); setSelectedResult(result); setScreen('ready') }} />
  const fallbackTrain = selectedTrain || mockTrains[0]
  const fallbackResult = selectedResult || optimizeSeats({ passengers: journeyTravellers, preferences: journeyPreferences, availableSeats: getSyntheticSeatsForTrain(fallbackTrain.id) })
  return <JourneyReady journey={journey} train={fallbackTrain} result={fallbackResult} onStartAgain={() => { setSelectedTrain(null); setSelectedResult(null); setScreen('home') }} />
}
