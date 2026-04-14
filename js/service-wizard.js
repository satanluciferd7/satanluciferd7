/* ===== SERVICE WIZARD SYSTEM ===== */

const ServiceWizards = {
  citizenship: {
    title: 'Citizenship Certificate',
    subtitle: 'Complete guide to obtaining your citizenship certificate',
    steps: [
      {
        title: 'Required Documents',
        content: 'Gather these documents before applying:',
        checklist: [
          { item: 'Birth Certificate', cost: 'Free', time: 'Already have or get from municipality' },
          { item: 'Parents\' Citizenship', cost: 'Free', time: 'Photocopies are sufficient' },
          { item: 'Proof of Residence', cost: 'Variable', time: 'Recent utility bill or property document' },
          { item: 'Passport Photos', cost: 'NPR 300-500', time: '4x6cm size' }
        ]
      },
      {
        title: 'Application Process',
        content: 'Follow these steps:',
        checklist: [
          { item: 'Visit District Office', cost: 'Travel', time: '9 AM - 5 PM, Mon-Fri' },
          { item: 'Get Registration Form', cost: 'NPR 50', time: '5 minutes' },
          { item: 'Fill Form & Documents', cost: 'Free', time: '30-45 minutes' },
          { item: 'Submit & Get Token', cost: 'Processing fee NPR 500', time: 'Receive receipt' }
        ]
      },
      {
        title: 'Cost Summary',
        content: 'Here\'s the complete cost breakdown:',
        costs: [
          { item: 'Birth Certificate Copy', amount: 'NPR 50' },
          { item: 'Registration Form', amount: 'NPR 50' },
          { item: 'Processing Fee', amount: 'NPR 500' },
          { item: 'Passport Photos', amount: 'NPR 400' },
          { item: 'TOTAL', amount: 'NPR 1,000' }
        ],
        timeline: '3-5 working days'
      }
    ]
  },

  passport: {
    title: 'Passport Application',
    subtitle: 'Complete guide to getting your Nepalese passport',
    steps: [
      {
        title: 'Document Checklist',
        content: 'Prepare these documents:',
        checklist: [
          { item: 'Citizenship Certificate', cost: 'Required', time: 'Original + 2 copies' },
          { item: 'Application Form (P form)', cost: 'Free', time: 'Download from dop.gov.np' },
          { item: 'Passport Photos', cost: 'NPR 500-800', time: '4x6cm, white background' },
          { item: 'Birth Certificate', cost: 'Free', time: 'Photocopy required' }
        ]
      },
      {
        title: 'Passport Types',
        content: 'Choose the type you need:',
        checklist: [
          { item: 'Ordinary (Green)', cost: 'NPR 6,000', time: '32 pages, 5 years' },
          { item: 'Ordinary Extended (Blue)', cost: 'NPR 12,000', time: '64 pages, 10 years' },
          { item: 'Official Passport (White)', cost: 'Special', time: 'Government use only' }
        ]
      },
      {
        title: 'Processing & Fees',
        content: 'Standard and express options:',
        costs: [
          { item: 'Green Passport (32 pages)', amount: 'NPR 6,000' },
          { item: 'Blue Passport (64 pages)', amount: 'NPR 12,000' },
          { item: 'Express Processing (+3 days)', amount: 'NPR 2,000' },
          { item: 'Courier Fee (optional)', amount: 'NPR 500' },
          { item: 'TOTAL', amount: 'NPR 6,000-12,000' }
        ],
        timeline: '10-15 days (normal), 3-5 days (express)'
      }
    ]
  },

  driving: {
    title: 'Driving License',
    subtitle: 'Comprehensive guide to obtaining your driving license',
    steps: [
      {
        title: 'License Categories',
        content: 'Choose your category:',
        checklist: [
          { item: 'Category A (Motorcycle)', cost: 'NPR 1,000', time: 'Two-wheeler' },
          { item: 'Category B (Car/Jeep)', cost: 'NPR 1,500', time: 'Light vehicles up to 3,500 kg' },
          { item: 'Category C (Truck)', cost: 'NPR 2,000', time: 'Medium commercial vehicles' },
          { item: 'Category D (Bus)', cost: 'NPR 3,000', time: 'Public vehicles 9+ seats' }
        ]
      },
      {
        title: 'Eligibility & Documents',
        content: 'Requirements you must meet:',
        checklist: [
          { item: 'Age 16+ for motorcycle, 18+ for cars', cost: 'Birth cert', time: 'Proof required' },
          { item: 'Citizenship Certificate', cost: 'Free', time: 'Original copy' },
          { item: 'Eye test report', cost: 'NPR 200', time: 'From authorized clinic' },
          { item: 'Medical fitness', cost: 'NPR 300', time: 'From registered doctor' }
        ]
      },
      {
        title: 'Test & Registration',
        content: 'Total cost for Category B (Car):',
        costs: [
          { item: 'License Fee', amount: 'NPR 1,500' },
          { item: 'Eye Test', amount: 'NPR 200' },
          { item: 'Medical Checkup', amount: 'NPR 300' },
          { item: 'Written Test Form', amount: 'NPR 100' },
          { item: 'Practical Test', amount: 'Free' },
          { item: 'TOTAL', amount: 'NPR 2,100' }
        ],
        timeline: '5-7 days from application'
      }
    ]
  },

  education: {
    title: 'Education & Scholarships',
    subtitle: 'Guide to enrolling in universities and finding scholarships',
    steps: [
      {
        title: 'Major Universities',
        content: 'Top education institutions in Nepal:',
        checklist: [
          { item: 'Tribhuvan University (TU)', cost: 'NPR 20,000-50,000/sem', time: 'Largest, 60+ campuses' },
          { item: 'Kathmandu University (KU)', cost: 'NPR 80,000-150,000/sem', time: 'Private, high quality' },
          { item: 'Pokhara University (PU)', cost: 'NPR 60,000-100,000/sem', time: 'Private, growing' }
        ]
      },
      {
        title: 'Scholarship Types',
        content: 'Available scholarships:',
        checklist: [
          { item: 'Government Scholarships', cost: 'Full/Partial', time: 'Merit-based' },
          { item: 'International Scholarships', cost: 'Full/Partial', time: 'Study abroad' },
          { item: 'Merit-Based', cost: 'Tuition waiver', time: 'Top performers' },
          { item: 'Need-Based', cost: 'Full/Partial', time: 'Low-income families' }
        ]
      },
      {
        title: 'Enrollment Process',
        content: 'Typical annual education costs:',
        costs: [
          { item: 'Tuition Fee (Government University)', amount: 'NPR 30,000-50,000/year' },
          { item: 'Entrance Exam Form', amount: 'NPR 500-1,000' },
          { item: 'Registration', amount: 'NPR 1,000-5,000' },
          { item: 'Books & Materials', amount: 'NPR 10,000-20,000/year' },
          { item: 'TOTAL', amount: 'NPR 40,000-75,000/year' }
        ],
        timeline: 'Varies by university (4-6 years)'
      }
    ]
  },

  health: {
    title: 'Health Insurance',
    subtitle: 'Complete guide to National Health Insurance in Nepal',
    steps: [
      {
        title: 'Coverage Details',
        content: 'What the National Health Insurance covers:',
        checklist: [
          { item: 'Inpatient Hospital Care', cost: 'Up to NPR 1,00,000/year', time: 'All public hospitals' },
          { item: 'Outpatient Services', cost: 'Primary health centers', time: 'Free check-ups' },
          { item: 'Emergency Services', cost: 'Covered', time: '24/7 coverage' },
          { item: 'Medicines', cost: 'Included (generic)', time: 'From government list' }
        ]
      },
      {
        title: 'Eligibility',
        content: 'Who can register:',
        checklist: [
          { item: 'All Nepali Citizens', cost: 'No cost', time: 'Universal coverage' },
          { item: 'Ages 0-60', cost: 'No age limit', time: 'Family members included' },
          { item: 'Dependents', cost: 'Family benefits', time: '4 members per family' }
        ]
      },
      {
        title: 'Registration & Costs',
        content: 'How to register:',
        costs: [
          { item: 'Registration Process', amount: 'Free' },
          { item: 'Annual Coverage Limit', amount: 'NPR 1,00,000 per person' },
          { item: 'Family Card (4 members)', amount: 'Under one policy' },
          { item: 'Processing Time', amount: '5-7 working days' },
          { item: 'TOTAL COST', amount: 'Free' }
        ],
        timeline: 'Register at district health office'
      }
    ]
  },

  tax: {
    title: 'Tax & PAN Registration',
    subtitle: 'Guide to registering for PAN and filing taxes',
    steps: [
      {
        title: 'Who Needs PAN',
        content: 'You must register if:',
        checklist: [
          { item: 'Annual income > NPR 5,00,000', cost: 'Required', time: 'All working individuals' },
          { item: 'Running a business', cost: 'Mandatory', time: 'Even if loss-making' },
          { item: 'Importing goods', cost: 'Required', time: 'For customs' },
          { item: 'Buying property', cost: 'Required', time: 'For registration' }
        ]
      },
      {
        title: 'Documents Needed',
        content: 'Prepare these documents:',
        checklist: [
          { item: 'Citizenship Certificate', cost: 'Original', time: 'Both sides copy' },
          { item: 'Bank Account Details', cost: 'Bank statement', time: 'Last 3 months' },
          { item: 'Business License', cost: 'If applicable', time: 'Registration certificate' },
          { item: 'Address Proof', cost: 'Utility bill', time: 'Recent document' }
        ]
      },
      {
        title: 'Registration Process',
        content: 'Complete cost breakdown:',
        costs: [
          { item: 'PAN Registration', amount: 'Free' },
          { item: 'Online Application Form', amount: 'Free' },
          { item: 'IRD Office Visit', amount: 'Travel cost' },
          { item: 'First Year Tax Filing', amount: 'Free' },
          { item: 'TOTAL', amount: 'Free' }
        ],
        timeline: '3-5 working days at IRD'
      }
    ]
  }
};

let currentWizard = null;
let currentStep = 0;

function openWizard(wizardId) {
  currentWizard = wizardId;
  currentStep = 0;
  renderWizard();
  document.getElementById('wizardModal').classList.add('open');
}

function closeWizard() {
  document.getElementById('wizardModal').classList.remove('open');
  currentWizard = null;
  currentStep = 0;
}

function renderWizard() {
  const wizard = ServiceWizards[currentWizard];
  const step = wizard.steps[currentStep];
  const totalSteps = wizard.steps.length;

  let html = `
    <div class="wizard-header">
      <h2 class="wizard-title">${wizard.title}</h2>
      <p class="wizard-subtitle">${wizard.subtitle}</p>
    </div>

    <div class="wizard-steps">
  `;
  
  for (let i = 0; i < totalSteps; i++) {
    html += `<div class="step-indicator ${i <= currentStep ? 'active' : ''}"></div>`;
  }
  html += '</div>';

  html += `<div class="wizard-content"><h4>${step.title}</h4><p>${step.content}</p>`;

  if (step.checklist) {
    html += '<div class="checklist">';
    step.checklist.forEach((item, idx) => {
      html += `
        <div class="checklist-item">
          <div class="checklist-checkbox" onclick="toggleCheckbox(this)">
            <i class="fas fa-check" style="display:none;"></i>
          </div>
          <div class="checklist-text">
            <strong>${item.item}</strong>
            <span>${item.cost || item.amount || ''} • ${item.time || ''}</span>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }

  if (step.costs) {
    html += '<div class="cost-calculator">';
    step.costs.forEach(cost => {
      html += `<div class="cost-item"><span>${cost.item}</span><span class="cost-amount">${cost.amount}</span></div>`;
    });
    html += '</div>';
    if (step.timeline) {
      html += `<p><strong>Expected Timeline:</strong> ${step.timeline}</p>`;
    }
  }

  html += '</div>';

  html += `
    <div class="wizard-footer">
      ${currentStep > 0 ? `<button class="btn btn-secondary" onclick="previousStep()"><i class="fas fa-arrow-left"></i> Previous</button>` : ''}
      ${currentStep < totalSteps - 1 ? `<button class="btn btn-primary" onclick="nextStep()">Next <i class="fas fa-arrow-right"></i></button>` : `<button class="btn btn-primary" onclick="completeWizard()"><i class="fas fa-check"></i> Complete</button>`}
    </div>
  `;

  document.getElementById('wizardContent').innerHTML = html;
}

function nextStep() {
  const wizard = ServiceWizards[currentWizard];
  if (currentStep < wizard.steps.length - 1) {
    currentStep++;
    renderWizard();
  }
}

function previousStep() {
  if (currentStep > 0) {
    currentStep--;
    renderWizard();
  }
}

function toggleCheckbox(element) {
  element.classList.toggle('checked');
  element.querySelector('i').style.display = element.classList.contains('checked') ? 'inline' : 'none';
}

function completeWizard() {
  const wizard = ServiceWizards[currentWizard];
  document.getElementById('wizardContent').innerHTML = `
    <div class="success-state">
      <div class="success-icon"><i class="fas fa-check-circle"></i></div>
      <h3>Great! You're ready to proceed</h3>
      <p>You now have all the information needed to apply for <strong>${wizard.title}</strong></p>
      <p style="margin: 20px 0; font-size: 0.9rem; color: var(--text-muted);">
        Next steps: Visit the relevant government office with your documents ready.
      </p>
      <button class="btn btn-primary" onclick="closeWizard()"><i class="fas fa-home"></i> Back to Home</button>
    </div>
  `;
}
