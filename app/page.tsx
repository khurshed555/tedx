'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Link from 'next/link'

export default function Home() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speedX: number; speedY: number }>>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [formData, setFormData] = useState({ name: '', grade: '', topic: '', terms: false })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const fullText = "Join us for TEDx SAMPS, where ideas inspire change and ignite new possibilities. "
  const aboutSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const createParticles = () => {
      const newParticles = []
      const aboutSection = aboutSectionRef.current
      if (aboutSection) {
        const { width, height } = aboutSection.getBoundingClientRect()
        for (let i = 0; i < 50; i++) {
          newParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 5 + 2,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
          })
        }
      }
      setParticles(newParticles)
    }

    createParticles()
    window.addEventListener('resize', createParticles)

    const animateParticles = () => {
      const aboutSection = aboutSectionRef.current
      if (aboutSection) {
        const { width, height } = aboutSection.getBoundingClientRect()
        setParticles(prevParticles =>
          prevParticles.map(particle => ({
            ...particle,
            x: (particle.x + particle.speedX + width) % width,
            y: (particle.y + particle.speedY + height) % height,
          }))
        )
      }
    }

    const particleInterval = setInterval(animateParticles, 50)

    let i = 0
    const typingInterval = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i = (i + 1) % (fullText.length + 1)
      if (i === fullText.length) {
        clearInterval(typingInterval)
      }
    }, 150)

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    return () => {
      clearInterval(particleInterval)
      clearInterval(typingInterval)
      clearInterval(cursorInterval)
      window.removeEventListener('resize', createParticles)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.grade) newErrors.grade = 'Grade is required'
    if (!formData.topic.trim()) newErrors.topic = 'Topic is required'
    if (!formData.terms) newErrors.terms = 'You must agree to the terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, telegramUserId: '5240001339' })
        })
        if (response.ok) {
          toast.success('Your submission has been sent successfully.')
          setFormData({ name: '', grade: '', topic: '', terms: false })
        } else {
          throw new Error('Submission failed')
        }
      } catch (error) {
        toast.error('There was a problem submitting your form. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Navigation */}
      <nav className="bg-black bg-opacity-80 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-white font-bold text-xl">
                TEDx SamPS
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {['about', 'organizers', 'register', 'details'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['about', 'organizers', 'register', 'details'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Header (Hero Section) */}
      <header className="relative bg-gradient-to-r from-red-800 to-red-600 py-32 text-center">
  <h1 
    className="text-4xl md:text-7xl font-bold mb-4 leading-tight min-h-[180px] p-10 mx-auto"
    style={{ maxWidth: '80%', padding: '20px', margin: '0 auto' }}
  >
    {typedText}
    <span
      className={`inline-block w-0.5 h-8 ml-1 bg-white transition-opacity duration-300 ${
        showCursor ? 'opacity-100' : 'opacity-0'
      }`}
    ></span>
  </h1>
  <button
    onClick={() => scrollToSection('register')}
    className="bg-white text-red-600 hover:bg-red-100 transition-all duration-300 transform hover:scale-105 text-lg py-6 px-10 rounded-md font-bold"
  >
    Register Now
  </button>
</header>


      {/* About the Event Section */}
      <section id="about" ref={aboutSectionRef} className="relative py-20 px-4 max-w-4xl mx-auto text-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, index) => (
            <div
              key={index}
              className="absolute bg-red-500 rounded-full opacity-10"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-8 text-red-500">About the Event</h2>
          <p className="text-2xl leading-relaxed text-gray-300">
            Our TEDx event is organized by students and teachers to provide a platform where young minds can share innovative
            ideas and stories. Join us for an inspiring day of thought-provoking talks and engaging discussions that will
            challenge your perspective and ignite your passion for change.
          </p>
        </div>
      </section>

      {/* Organizers Section */}
{/* Organizers Section */}
<section id="organizers" className="py-20 px-4 bg-white text-gray-900">
  <h2 className="text-4xl font-bold mb-12 text-center text-red-600">Meet Our Organizers</h2>
  <div className="flex flex-wrap justify-center gap-12">
    {[
      { name: 'Gizem Oyguç', role: 'Teacher', description: 'Gizem Oyguç, an educator from Turkey with over 10 years of experience, is passionate about empowering students through creativity and leadership. She brings her international perspective to ensure TEDx SamPS sparks meaningful ideas and conversations.', imgSrc: 'teacher.jpg' },
      { name: 'John Smith', role: 'Student', description: 'A 15-year-old student at SamPS, is passionate about organizing events and fostering collaboration among peers. With a love for teamwork and creative problem-solving, he is committed to making this TEDx event a memorable experience for everyone.', imgSrc: 'student.jpg' }
    ].map((organizer, index) => (
      <div
        key={index}
        className="w-80 bg-white shadow-xl rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
      >
        <div className="p-8">
          <div className="relative w-36 h-36 mx-auto mb-6 overflow-hidden rounded-full border-4 border-red-500">
            <img
              src={`/${organizer.imgSrc}`}
              alt={organizer.name}
              className="w-full h-full object-cover"
              style={{ width: '150px', height: '150px' }}
            />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-red-600">{organizer.name}</h3>
          <p className="text-gray-600 mb-4 font-medium">{organizer.role}</p>
          <p className="text-gray-700">{organizer.description}</p>
        </div>
      </div>
    ))}
  </div>
</section>


      {/* Registration Form Section */}
      <section id="register" className="py-20 px-4 max-w-2xl mx-auto bg-gray-900">
        <h2 className="text-4xl font-bold mb-12 text-center text-red-500">Register to Speak</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-red-500 bg-gray-800 text-white border-gray-700"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-red-500 bg-gray-800 text-white border-gray-700"
            >
              <option value="">Select Grade / Class</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
            {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
          </div>
          <div>
            <textarea
              placeholder="Speech Topic"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-red-500 bg-gray-800 text-white border-gray-700"
              rows={4}
            />
            {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleInputChange}
              className="rounded text-red-600 focus:ring-red-500 bg-gray-800 border-gray-700"
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70  text-gray-300"
            >
              I confirm that my talk is original and aligns with TEDx guidelines.
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 text-lg py-6 rounded-md text-white font-bold"
          >
            Submit Application
          </button>
        </form>
      </section>

      {/* Event Details Section */}
      <section id="details" className="py-20 px-4 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">Event Details</h2>
          <div className="bg-white text-gray-900 rounded-lg p-8 shadow-2xl">
            <p className="text-2xl mb-4"><span className="font-bold text-red-600">Date:</span> October 15, 2024</p>
            <p className="text-2xl mb-4"><span className="font-bold text-red-600">Time:</span> 4:00 PM</p>
            <p className="text-2xl mb-4"><span className="font-bold text-red-600">Venue:</span> School Amphitheatre</p>
          </div>
        </div>
      </section>
    </div>
  )
}