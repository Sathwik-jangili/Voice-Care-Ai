import { NextResponse } from 'next/server';
import { getDbConnection } from '@/scripts/db';

// Smart AI Response function using all patient data with symptom-to-condition mapping and future prediction
async function getAIResponse(prompt: string, patientData: any) {
    console.log("AI Prompt:", prompt);
    console.log("Patient Data:", JSON.stringify(patientData, null, 2));

    const lowerPrompt = prompt.toLowerCase();
    let response = '';
    
    // Build comprehensive patient context
    const { patient, conditions, medications, observations, symptoms_history, medical_notes, allergies } = patientData;
    
    // Symptom to condition mapping database
    const symptomConditionMap: { [key: string]: string[] } = {
        'fever': ['diarrhea', 'flu', 'infection', 'covid-19'],
        'cough': ['flu', 'cold', 'asthma', 'covid-19'],
        'cold': ['flu', 'common cold', 'allergies'],
        'body pain': ['flu', 'fever', 'infection', 'arthritis'],
        'headache': ['migraine', 'fever', 'hypertension', 'stress'],
        'nausea': ['diarrhea', 'food poisoning', 'migraine'],
        'vomiting': ['diarrhea', 'food poisoning', 'stomach flu'],
        'stomach pain': ['diarrhea', 'food poisoning', 'ulcer'],
        'fatigue': ['anemia', 'diabetes', 'depression', 'flu'],
        'dizziness': ['hypotension', 'hypertension', 'anemia'],
        'chest pain': ['heart disease', 'anxiety', 'asthma'],
        'shortness of breath': ['asthma', 'heart disease', 'anxiety'],
        'frequent urination': ['diabetes', 'urinary tract infection', 'kidney disease'],
        'thirst': ['diabetes'],
        'weight loss': ['diabetes', 'cancer', 'hyperthyroidism'],
        'weight gain': ['hypothyroidism', 'depression'],
        'rash': ['allergies', 'skin infection', 'eczema'],
        'itching': ['allergies', 'skin condition'],
        'swelling': ['heart disease', 'kidney disease', 'allergies'],
        // Kidney-specific symptoms
        'back pain': ['kidney disease', 'kidney stones', 'urinary tract infection'],
        'kidney pain': ['kidney disease', 'kidney stones', 'kidney infection'],
        'flank pain': ['kidney disease', 'kidney stones'],
        'pain near kidney': ['kidney disease', 'kidney stones'],
        'lower back pain': ['kidney disease', 'urinary tract infection'],
        'blood in urine': ['kidney disease', 'kidney stones', 'urinary tract infection'],
        'dark urine': ['kidney disease', 'dehydration'],
        'foamy urine': ['kidney disease'],
        'changes in urination': ['kidney disease', 'urinary tract infection', 'diabetes'],
        'difficulty urinating': ['kidney disease', 'prostate issues'],
        'painful urination': ['urinary tract infection', 'kidney stones'],
        'night urination': ['kidney disease', 'diabetes'],
        // Heart-specific symptoms
        'palpitations': ['heart disease', 'anxiety'],
        'irregular heartbeat': ['heart disease', 'arrhythmia'],
        'leg swelling': ['heart disease', 'kidney disease'],
        'breathing difficulty': ['heart disease', 'asthma'],
        'exercise intolerance': ['heart disease'],
        // Diabetes-specific symptoms
        'increased hunger': ['diabetes'],
        'blurry vision': ['diabetes', 'eye problems'],
        'numbness': ['diabetes', 'nerve damage'],
        'tingling': ['diabetes', 'nerve damage'],
        'slow healing': ['diabetes'],
        // Respiratory symptoms
        'wheezing': ['asthma'],
        'tight chest': ['asthma', 'heart disease'],
        'mucus': ['flu', 'cold', 'asthma'],
        // Mental health symptoms
        'anxiety': ['anxiety disorder', 'heart disease'],
        'depression': ['depression', 'diabetes'],
        'mood changes': ['depression', 'bipolar disorder'],
        'sleep problems': ['depression', 'anxiety disorder']
    };

    // Future symptoms prediction database - what symptoms patients can expect for each condition
    const futureSymptomsByCondition: { [key: string]: string[] } = {
        'hypertension': [
            'headaches', 'dizziness', 'nosebleeds', 'vision changes', 
            'chest pain', 'shortness of breath', 'fatigue', 'irregular heartbeat'
        ],
        'kidney disease': [
            'back pain near kidneys', 'changes in urination', 'swelling in legs/feet',
            'fatigue', 'nausea', 'muscle cramps', 'difficulty concentrating', 'foamy urine'
        ],
        'diabetes': [
            'increased thirst', 'frequent urination', 'extreme hunger', 'unexplained weight loss',
            'fatigue', 'irritability', 'blurry vision', 'slow-healing sores', 'frequent infections'
        ],
        'heart disease': [
            'chest pain', 'shortness of breath', 'pain in neck/jaw/back', 'pain in arms/shoulders',
            'fatigue', 'swelling in legs', 'irregular heartbeat', 'dizziness'
        ],
        'asthma': [
            'shortness of breath', 'chest tightness', 'wheezing', 'coughing attacks',
            'difficulty sleeping', 'fatigue', 'anxiety'
        ],
        'diarrhea': [
            'abdominal cramps', 'bloating', 'nausea', 'urgent need to use bathroom',
            'fever', 'dehydration signs', 'loss of appetite'
        ],
        'arthritis': [
            'joint pain', 'stiffness', 'swelling', 'reduced range of motion',
            'redness', 'warmth', 'fatigue', 'fever'
        ],
        'anemia': [
            'fatigue', 'weakness', 'pale skin', 'shortness of breath', 'dizziness',
            'irregular heartbeat', 'cold hands/feet', 'headaches'
        ],
        'depression': [
            'persistent sadness', 'loss of interest', 'sleep changes', 'appetite changes',
            'fatigue', 'worthlessness', 'concentration problems', 'suicidal thoughts'
        ],
        'anxiety disorder': [
            'excessive worry', 'restlessness', 'fatigue', 'difficulty concentrating',
            'irritability', 'sleep problems', 'physical symptoms like racing heart'
        ]
    };

    // Food recommendations database - what to eat and avoid for each condition
    const foodRecommendationsByCondition: { [key: string]: { eat: string[], avoid: string[] } } = {
        'hypertension': {
            eat: [
                'leafy greens (spinach, kale)', 'berries', 'bananas', 'avocados', 'oats',
                'salmon and fatty fish', 'nuts and seeds', 'beans and lentils',
                'low-fat dairy', 'whole grains', 'garlic', 'dark chocolate'
            ],
            avoid: [
                'high-sodium processed foods', 'canned soups', 'frozen dinners',
                'pickles and olives', 'salty snacks (chips, pretzels)', 'deli meats',
                'bacon and sausage', 'excessive cheese', 'fast food', 'sauces and dressings'
            ]
        },
        'kidney disease': {
            eat: [
                'cauliflower', 'blueberries', 'fish', 'whole grains', 'egg whites',
                'garlic', 'olive oil', 'red bell peppers', 'cabbage', 'apples',
                'limited amounts of high-quality protein', 'low-potassium fruits'
            ],
            avoid: [
                'high-potassium foods (bananas, oranges, potatoes)', 'high-sodium foods',
                'dark colas', 'avocados', 'dairy products', 'nuts and seeds',
                'processed meats', 'canned foods', 'whole grain breads', 'beans and lentils'
            ]
        },
        'diabetes': {
            eat: [
                'non-starchy vegetables', 'leafy greens', 'whole grains', 'lean proteins',
                'beans and lentils', 'berries', 'nuts and seeds', 'Greek yogurt',
                'fish', 'avocados', 'olive oil', 'cinnamon', 'quinoa'
            ],
            avoid: [
                'sugary drinks', 'white bread and pasta', 'processed snacks',
                'candy and desserts', 'fruit juices', 'fried foods',
                'white rice', 'potatoes', 'sweetened cereals', 'honey and maple syrup'
            ]
        },
        'heart disease': {
            eat: [
                'salmon and fatty fish', 'oats and barley', 'nuts and seeds',
                'olive oil', 'avocados', 'berries', 'leafy greens', 'whole grains',
                'beans', 'dark chocolate', 'green tea', 'legumes'
            ],
            avoid: [
                'trans fats (margarine, fried foods)', 'processed meats',
                'high-sodium foods', 'sugary drinks', 'refined carbohydrates',
                'red meat', 'full-fat dairy', 'fast food', 'commercial baked goods'
            ]
        },
        'asthma': {
            eat: [
                'fruits rich in vitamin C', 'leafy greens', 'turmeric', 'ginger',
                'salmon', 'nuts and seeds', 'whole grains', 'beans',
                'yogurt with probiotics', 'garlic', 'onions'
            ],
            avoid: [
                'sulfite-containing foods (wine, dried fruits)', 'processed meats',
                'dairy products (if sensitive)', 'shellfish', 'peanuts',
                'food additives and preservatives', 'frozen foods'
            ]
        },
        'diarrhea': {
            eat: [
                'BRAT diet foods (bananas, rice, applesauce, toast)', 'oatmeal',
                'boiled potatoes', 'steamed chicken', 'yogurt with probiotics',
                'clear broths', 'crackers', 'cooked carrots', 'electrolyte drinks'
            ],
            avoid: [
                'dairy products', 'spicy foods', 'fatty foods', 'fried foods',
                'high-fiber foods', 'caffeine', 'alcohol', 'artificial sweeteners',
                'raw vegetables', 'beans and lentils'
            ]
        },
        'arthritis': {
            eat: [
                'fatty fish (salmon, mackerel)', 'berries', 'broccoli',
                'spinach', 'nuts and seeds', 'olive oil', 'whole grains',
                'beans', 'turmeric', 'ginger', 'green tea'
            ],
            avoid: [
                'processed foods', 'sugary drinks', 'fried foods', 'red meat',
                'refined grains', 'gluten-containing foods', 'nightshade vegetables',
                'dairy products', 'alcohol', 'salt'
            ]
        },
        'anemia': {
            eat: [
                'red meat', 'spinach and leafy greens', 'liver', 'beans and lentils',
                'fortified cereals', 'pumpkin seeds', 'dark chocolate', 'eggs',
                'oysters', 'tofu', 'dried fruits'
            ],
            avoid: [
                'coffee and tea (with meals)', 'calcium-rich foods (with iron-rich meals)',
                'high-fiber foods (with iron-rich meals)', 'excessive dairy',
                'phytate-containing foods (with iron-rich meals)'
            ]
        },
        'depression': {
            eat: [
                'fatty fish', 'nuts and seeds', 'dark chocolate', 'berries',
                'spinach', 'avocados', 'whole grains', 'beans', 'yogurt',
                'turkey', 'bananas', 'oats', 'green tea'
            ],
            avoid: [
                'processed foods', 'sugary foods', 'alcohol', 'caffeine',
                'refined carbohydrates', 'fast food', 'artificial sweeteners'
            ]
        },
        'anxiety disorder': {
            eat: [
                'salmon', 'chamomile tea', 'turkey', 'oats', 'yogurt',
                'nuts and seeds', 'dark chocolate', 'berries', 'avocados',
                'whole grains', 'leafy greens'
            ],
            avoid: [
                'caffeine', 'alcohol', 'processed foods', 'sugary foods',
                'fast food', 'artificial sweeteners', 'high-sodium foods'
            ]
        }
    };

    // Lifestyle recommendations database - what to do and not do for each condition
    const lifestyleRecommendationsByCondition: { [key: string]: { do: string[], notDo: string[] } } = {
        'hypertension': {
            do: [
                'monitor blood pressure regularly', 'exercise 30 minutes daily', 'practice stress reduction',
                'maintain healthy weight', 'limit alcohol to 1 drink/day', 'get 7-8 hours sleep',
                'practice deep breathing exercises', 'take medications as prescribed'
            ],
            notDo: [
                'smoke or use tobacco', 'skip blood pressure medication', 'ignore stress',
                'consume excessive alcohol', 'overeat or binge eat', 'ignore doctor appointments',
                'engage in high-intensity exercise without clearance', 'ignore weight gain'
            ]
        },
        'kidney disease': {
            do: [
                'follow fluid restrictions if prescribed', 'monitor blood pressure', 'limit protein intake',
                'attend regular dialysis appointments', 'track daily weight', 'take phosphate binders with meals',
                'practice good hygiene', 'report swelling immediately'
            ],
            notDo: [
                'take NSAIDs (ibuprofen, naproxen)', 'ignore fluid restrictions', 'consume high-potassium foods',
                'skip dialysis sessions', 'use herbal supplements without doctor approval',
                'ignore swelling or edema', 'consume excessive salt', 'delay reporting symptoms'
            ]
        },
        'diabetes': {
            do: [
                'monitor blood sugar regularly', 'take medications as prescribed', 'exercise regularly',
                'eat regular balanced meals', 'check feet daily', 'stay hydrated',
                'carry glucose tablets', 'attend regular eye exams'
            ],
            notDo: [
                'skip meals', 'ignore high blood sugar readings', 'smoke',
                'ignore foot sores or numbness', 'exercise when blood sugar is very high',
                'delay treating low blood sugar', 'ignore vision changes', 'skip medications'
            ]
        },
        'heart disease': {
            do: [
                'take medications exactly as prescribed', 'monitor heart rate and blood pressure',
                'exercise within doctor guidelines', 'eat heart-healthy diet', 'maintain healthy weight',
                'manage stress', 'quit smoking', 'attend cardiac rehab if recommended'
            ],
            notDo: [
                'ignore chest pain', 'skip medications', 'smoke or use tobacco',
                'overexert yourself', 'ignore swelling in legs', 'consume excessive salt',
                'delay seeking emergency care', 'ignore new symptoms'
            ]
        },
        'asthma': {
            do: [
                'use rescue inhaler as needed', 'avoid known triggers', 'take controller medications daily',
                'monitor peak flow readings', 'keep asthma action plan updated',
                'exercise with proper precautions', 'maintain clean indoor air', 'get flu shots'
            ],
            notDo: [
                'ignore early warning signs', 'skip controller medications', 'smoke',
                'expose yourself to allergens', 'exercise in cold air without precautions',
                'ignore peak flow readings', 'delay seeking help during attacks', 'use over-the-counter inhalers'
            ]
        },
        'diarrhea': {
            do: [
                'stay hydrated with clear fluids', 'use oral rehydration solution', 'rest and avoid strenuous activity',
                'eat BRAT diet foods', 'monitor for dehydration signs', 'practice good hand hygiene',
                'take probiotics if recommended', 'contact doctor if severe'
            ],
            notDo: [
                'consume dairy products', 'eat spicy or fatty foods', 'ignore dehydration signs',
                'take anti-diarrhea medications without doctor approval', 'return to work/school too soon',
                'ignore fever or blood in stool', 'delay medical care if severe', 'expose others to infection'
            ]
        },
        'arthritis': {
            do: [
                'do gentle range-of-motion exercises', 'apply heat or cold as needed', 'maintain healthy weight',
                'use assistive devices when needed', 'take anti-inflammatory medications as prescribed',
                'practice good posture', 'get adequate rest', 'do low-impact exercises'
            ],
            notDo: [
                'overdo activities during flare-ups', 'ignore joint pain', 'stay in one position too long',
                'skip prescribed exercises', 'ignore weight gain', 'use joints improperly',
                'delay seeking treatment', 'ignore medication side effects'
            ]
        },
        'anemia': {
            do: [
                'take iron supplements as prescribed', 'eat iron-rich foods with vitamin C',
                'avoid tea/coffee with iron-rich meals', 'monitor for improvement',
                'rest when fatigued', 'attend regular blood tests', 'report dizziness'
            ],
            notDo: [
                'skip iron supplements', 'ignore fatigue symptoms', 'consume calcium with iron-rich foods',
                'ignore dizziness or fainting', 'delay blood tests', 'ignore heavy periods',
                'self-medicate without doctor approval', 'ignore pale skin symptoms'
            ]
        },
        'depression': {
            do: [
                'take antidepressants as prescribed', 'attend therapy sessions', 'exercise regularly',
                'maintain regular sleep schedule', 'practice stress management', 'socialize with supportive people',
                'engage in enjoyable activities', 'contact therapist when symptoms worsen'
            ],
            notDo: [
                'skip medications', 'isolate yourself', 'use alcohol or drugs to cope',
                'ignore worsening symptoms', 'make major life decisions during depressive episodes',
                'stop therapy without medical advice', 'ignore suicidal thoughts', 'expect immediate results'
            ]
        },
        'anxiety disorder': {
            do: [
                'practice deep breathing exercises', 'use grounding techniques', 'take medications as prescribed',
                'exercise regularly', 'limit caffeine intake', 'practice mindfulness or meditation',
                'attend therapy sessions', 'get adequate sleep'
            ],
            notDo: [
                'avoid anxiety-provoking situations entirely', 'skip medications', 'use alcohol to self-medicate',
                'ignore panic attack symptoms', 'avoid seeking help', 'expect immediate relief',
                'isolate yourself', 'ignore sleep problems'
            ]
        }
    };

    // Alternative medications database - current and alternative medications for each condition
    const medicationAlternativesByCondition: { [key: string]: { current: string[], alternatives: string[] } } = {
        'hypertension': {
            current: [
                'Lisinopril', 'Amlodipine', 'Losartan', 'Hydrochlorothiazide', 'Metoprolol',
                'Atenolol', 'Valsartan', 'Furosemide'
            ],
            alternatives: [
                'Enalapril', 'Ramipril', 'Benazepril', 'Nifedipine', 'Diltiazem',
                'Irbesartan', 'Olmesartan', 'Telmisartan', 'Spironolactone', 'Clonidine'
            ]
        },
        'kidney disease': {
            current: [
                'Phosphate binders (Calcium acetate)', 'Erythropoietin (EPO)', 'Iron supplements',
                'Vitamin D analogs', 'Sodium bicarbonate', 'Calcitriol'
            ],
            alternatives: [
                'Sevelamer carbonate', 'Lanthanum carbonate', 'Darbepoetin alfa', 'Ferric citrate',
                'Doxercalciferol', 'Paricalcitol', 'Cinacalcet', 'IV iron formulations'
            ]
        },
        'diabetes': {
            current: [
                'Metformin', 'Glipizide', 'Insulin glargine', 'Sitagliptin', 'Empagliflozin',
                'Liraglutide', 'Pioglitazone'
            ],
            alternatives: [
                'Metformin XR', 'Glimepiride', 'Insulin detemir', 'Saxagliptin', 'Dapagliflozin',
                'Semaglutide', 'Canagliflozin', 'Acarbose', 'Repaglinide', 'Miglitol'
            ]
        },
        'heart disease': {
            current: [
                'Aspirin', 'Atorvastatin', 'Metoprolol', 'Lisinopril', 'Clopidogrel',
                'Isosorbide mononitrate', 'Furosemide'
            ],
            alternatives: [
                'Warfarin', 'Rivaroxaban', 'Rosuvastatin', 'Pravastatin', 'Simvastatin',
                'Carvedilol', 'Bisoprolol', 'Ramipril', 'Nitroglycerin', 'Spironolactone'
            ]
        },
        'asthma': {
            current: [
                'Albuterol inhaler', 'Fluticasone inhaler', 'Montelukast', 'Prednisone',
                'Salmeterol', 'Budesonide'
            ],
            alternatives: [
                'Levalbuterol', 'Beclomethasone', 'Mometasone', 'Zafirlukast', 'Formoterol',
                'Theophylline', 'Omalizumab', 'Dupilumab', 'Tiotropium', 'Ciclesonide'
            ]
        },
        'diarrhea': {
            current: [
                'Loperamide', 'Oral rehydration solution', 'Zinc supplements', 'Probiotics'
            ],
            alternatives: [
                'Bismuth subsalicylate', 'Diphenoxylate-atropine', 'Racecadotril', 'Saccharomyces boulardii',
                'Lactobacillus GG', 'Attapulgite', 'Activated charcoal', 'Electrolyte powders'
            ]
        },
        'arthritis': {
            current: [
                'Ibuprofen', 'Naproxen', 'Acetaminophen', 'Methotrexate', 'Prednisone',
                'Hydroxychloroquine'
            ],
            alternatives: [
                'Celecoxib', 'Diclofenac', 'Meloxicam', 'Sulfasalazine', 'Leflunomide',
                'Etanercept', 'Adalimumab', 'Infliximab', 'Abatacept', 'Tofacitinib'
            ]
        },
        'anemia': {
            current: [
                'Ferrous sulfate', 'Folic acid', 'Vitamin B12', 'Iron dextran', 'Epoetin alfa'
            ],
            alternatives: [
                'Ferrous gluconate', 'Ferrous fumarate', 'Iron sucrose', 'Ferric carboxymaltose',
                'Darbepoetin alfa', 'Methoxy polyethylene glycol-epoetin beta', 'Cyanocobalamin'
            ]
        },
        'depression': {
            current: [
                'Sertraline', 'Fluoxetine', 'Escitalopram', 'Bupropion', 'Venlafaxine',
                'Mirtazapine', 'Trazodone'
            ],
            alternatives: [
                'Paroxetine', 'Citalopram', 'Duloxetine', 'Desvenlafaxine', 'Nortriptyline',
                'Amitriptyline', 'Clomipramine', 'Phenelzine', 'Selegiline', 'Vilazodone'
            ]
        },
        'anxiety disorder': {
            current: [
                'Alprazolam', 'Lorazepam', 'Diazepam', 'Buspirone', 'Hydroxyzine',
                'Sertraline', 'Escitalopram'
            ],
            alternatives: [
                'Clonazepam', 'Oxazepam', 'Temazepam', 'Pregabalin', 'Gabapentin',
                'Duloxetine', 'Venlafaxine', 'Propranolol', 'Clonidine', 'Vistaril'
            ]
        }
    };

    // Check if user is asking about medication alternatives
    if (lowerPrompt.includes('medication') || lowerPrompt.includes('medicine') || lowerPrompt.includes('alternative') || lowerPrompt.includes('different medicine') || lowerPrompt.includes('other options')) {
        response = `Based on your diagnosed conditions, here are medication options and alternatives:\n\n`;
        
        let hasMedications = false;
        conditions.forEach((condition: any) => {
            const conditionName = condition.name.toLowerCase();
            const medAlternatives = medicationAlternativesByCondition[conditionName];
            
            if (medAlternatives) {
                hasMedications = true;
                response += `For ${condition.name}:\n`;
                response += `\n💊 Common Current Medications:\n`;
                medAlternatives.current.forEach(med => {
                    response += `- ${med}\n`;
                });
                response += `\n🔄 Alternative Medications:\n`;
                medAlternatives.alternatives.forEach(med => {
                    response += `- ${med}\n`;
                });
                response += `\n`;
            }
        });
        
        // Also show patient's current medications from database
        if (medications.length > 0) {
            response += `\n📋 Your Current Prescribed Medications:\n`;
            medications.forEach((med: any) => {
                response += `- ${med.name} (${med.status || 'active'})\n`;
            });
            response += `\n`;
        }
        
        if (!hasMedications) {
            response += "I don't have specific medication information for your conditions. Please consult with your healthcare provider for medication options.";
        } else {
            response += "⚠️ Important: Never change medications without consulting your healthcare provider. These alternatives are for informational purposes only.\n";
            response += "Your doctor will determine the best medication based on your specific health profile, other medications, and potential side effects.";
        }
        return response;
    }

    // Check if user is asking about lifestyle recommendations or what not to do
    if (lowerPrompt.includes('what not to do') || lowerPrompt.includes('not to do') || lowerPrompt.includes('should not do') || lowerPrompt.includes('avoid activities') || lowerPrompt.includes('lifestyle') || lowerPrompt.includes('activities')) {
        response = `Based on your diagnosed conditions, here are personalized lifestyle recommendations:\n\n`;
        
        let hasRecommendations = false;
        conditions.forEach((condition: any) => {
            const conditionName = condition.name.toLowerCase();
            const lifestyleRecs = lifestyleRecommendationsByCondition[conditionName];
            
            if (lifestyleRecs) {
                hasRecommendations = true;
                response += `For ${condition.name}:\n`;
                response += `\n✅ What to DO:\n`;
                lifestyleRecs.do.forEach(activity => {
                    response += `- ${activity}\n`;
                });
                response += `\n❌ What NOT to DO:\n`;
                lifestyleRecs.notDo.forEach(activity => {
                    response += `- ${activity}\n`;
                });
                response += `\n`;
            }
        });
        
        if (!hasRecommendations) {
            response += "I don't have specific lifestyle recommendations for your conditions. Please consult with your healthcare provider for personalized lifestyle advice.";
        } else {
            response += "Important: Always follow your healthcare provider's specific instructions and discuss any lifestyle changes with them first.";
        }
        return response;
    }

    // Check if user is asking about food recommendations
    if (lowerPrompt.includes('food') || lowerPrompt.includes('eat') || lowerPrompt.includes('diet') || lowerPrompt.includes('avoid')) {
        response = `Based on your diagnosed conditions, here are personalized dietary recommendations:\n\n`;
        
        let hasRecommendations = false;
        conditions.forEach((condition: any) => {
            const conditionName = condition.name.toLowerCase();
            const foodRecs = foodRecommendationsByCondition[conditionName];
            
            if (foodRecs) {
                hasRecommendations = true;
                response += `For ${condition.name}:\n`;
                response += `\n✅ Foods to EAT:\n`;
                foodRecs.eat.forEach(food => {
                    response += `- ${food}\n`;
                });
                response += `\n❌ Foods to AVOID:\n`;
                foodRecs.avoid.forEach(food => {
                    response += `- ${food}\n`;
                });
                response += `\n`;
            }
        });
        
        if (!hasRecommendations) {
            response += "I don't have specific dietary recommendations for your conditions. Please consult with a nutritionist or healthcare provider for personalized dietary advice.";
        } else {
            response += "Important: Always consult with your healthcare provider before making significant dietary changes, especially if you have multiple conditions or take medications.";
        }
        return response;
    }

    // Check if user is asking about future symptoms
    if (lowerPrompt.includes('symptoms') && (lowerPrompt.includes('expect') || lowerPrompt.includes('future') || lowerPrompt.includes('will have') || lowerPrompt.includes('what kind') || lowerPrompt.includes('anticipate') || lowerPrompt.includes('predict'))) {
        response = `Based on your diagnosed conditions, here are symptoms you might experience:\n\n`;
        
        conditions.forEach((condition: any, index: number) => {
            const conditionName = condition.name.toLowerCase();
            const futureSymptoms = futureSymptomsByCondition[conditionName] || [];
            
            if (futureSymptoms.length > 0) {
                response += `For ${condition.name}:\n`;
                futureSymptoms.forEach(symptom => {
                    response += `- ${symptom}\n`;
                });
                response += `\n`;
            }
        });
        
        response += "Important: Not everyone experiences all these symptoms. Contact your healthcare provider if you notice any new or worsening symptoms.";
        return response;
    }

    // Extract symptoms mentioned in the prompt
    const mentionedSymptoms: string[] = [];
    for (const [symptom, relatedConditions] of Object.entries(symptomConditionMap)) {
        if (lowerPrompt.includes(symptom)) {
            mentionedSymptoms.push(symptom);
        }
    }

    // Find matching conditions for mentioned symptoms
    const patientConditionNames = conditions.map((c: any) => c.name.toLowerCase());
    const matchingConditions: { symptom: string; condition: string; patientHasCondition: boolean }[] = [];

    mentionedSymptoms.forEach(symptom => {
        const relatedConditions = symptomConditionMap[symptom];
        relatedConditions.forEach(condition => {
            const conditionLower = condition.toLowerCase();
            const patientHasCondition = patientConditionNames.some((pc: string) => 
                pc.includes(conditionLower) || conditionLower.includes(pc)
            );
            matchingConditions.push({
                symptom,
                condition,
                patientHasCondition
            });
        });
    });

    // Build response based on symptom analysis
    if (mentionedSymptoms.length > 0) {
        // Check if symptoms match patient's existing conditions
        const relevantMatches = matchingConditions.filter(m => m.patientHasCondition);
        
        if (relevantMatches.length > 0) {
            // Symptoms match existing conditions
            response = `I notice you're experiencing ${mentionedSymptoms.join(', ')}. `;
            
            // Group by condition
            const conditionGroups: { [key: string]: string[] } = {};
            relevantMatches.forEach(match => {
                if (!conditionGroups[match.condition]) {
                    conditionGroups[match.condition] = [];
                }
                conditionGroups[match.condition].push(match.symptom);
            });
            
            response += "These symptoms are related to your existing condition(s): ";
            Object.entries(conditionGroups).forEach(([condition, symptoms], index) => {
                response += `${condition} (symptoms: ${symptoms.join(', ')})`;
                if (index < Object.keys(conditionGroups).length - 1) response += ", ";
            });
            response += ".\n\n";
            
            // Also warn about future symptoms they might experience
            response += "For your condition(s), you should also watch for these additional symptoms:\n";
            Object.keys(conditionGroups).forEach(condition => {
                const futureSymptoms = futureSymptomsByCondition[condition.toLowerCase()] || [];
                if (futureSymptoms.length > 0) {
                    response += `\n${condition} - Watch for: ${futureSymptoms.slice(0, 3).join(', ')}${futureSymptoms.length > 3 ? '...' : ''}\n`;
                }
            });
            response += "\n";
            
            // Provide specific advice for each condition
            if (conditionGroups['diarrhea']) {
                response += "For diarrhea-related symptoms:\n";
                response += "- Stay hydrated with clear fluids\n";
                response += "- Avoid dairy and fatty foods\n";
                response += "- Take oral rehydration solution if available\n";
                response += "- Monitor for dehydration signs\n";
                response += "- Your prescribed medications may help manage symptoms\n\n";
            }
            
            if (conditionGroups['kidney disease']) {
                response += "For kidney disease-related symptoms:\n";
                response += "- Monitor your fluid intake as recommended by your doctor\n";
                response += "- Avoid NSAIDs (like ibuprofen) unless prescribed\n";
                response += "- Track your blood pressure if you have hypertension\n";
                response += "- Watch for changes in urination patterns\n";
                response += "- Contact your doctor if pain is severe or persistent\n";
                response += "- Take your prescribed kidney medications as directed\n\n";
            }
            
            if (conditionGroups['diabetes']) {
                response += "For diabetes-related symptoms:\n";
                response += "- Check your blood sugar levels\n";
                response += "- Take your diabetes medications as prescribed\n";
                response += "- Stay hydrated\n";
                response += "- Contact your doctor if symptoms persist\n\n";
            }
            
            if (conditionGroups['hypertension'] || conditionGroups['high blood pressure']) {
                response += "For blood pressure related symptoms:\n";
                response += "- Take your blood pressure medication\n";
                response += "- Monitor your blood pressure\n";
                response += "- Reduce sodium intake\n";
                response += "- Rest and avoid stress\n\n";
            }
            
            if (conditionGroups['heart disease']) {
                response += "For heart disease-related symptoms:\n";
                response += "- Take your heart medications as prescribed\n";
                response += "- Monitor your blood pressure and heart rate\n";
                response += "- Avoid strenuous activity until symptoms improve\n";
                response += "- Call emergency services if chest pain is severe\n";
                response += "- Keep track of symptom triggers\n\n";
            }
            
            // General advice
            response += "General recommendations:\n";
            response += "- Rest and avoid strenuous activity\n";
            response += "- Continue your prescribed medications\n";
            response += "- Monitor symptoms and contact your doctor if they worsen\n";
            
        } else {
            // Symptoms mentioned but don't match existing conditions
            response = `I notice you're experiencing ${mentionedSymptoms.join(', ')}. `;
            response += "These symptoms don't appear to be directly related to your diagnosed conditions: ";
            response += conditions.map((c: any) => c.name).join(', ');
            response += ".\n\n";
            response += "Please monitor these symptoms and:\n";
            response += "- Rest and stay hydrated\n";
            response += "- Take over-the-counter fever reducers if appropriate\n";
            response += "- Contact your healthcare provider if symptoms persist or worsen\n";
            response += "- Keep track of when symptoms started and their severity\n";
        }
    }
    else {
        // No specific symptoms mentioned, use general health analysis
        if (lowerPrompt.includes('blood pressure') || lowerPrompt.includes('bp')) {
            const bpObservations = observations.filter((o: any) => o.code.toLowerCase().includes('blood pressure'));
            if (bpObservations.length > 0) {
                const latestBP = bpObservations[bpObservations.length - 1];
                response = `Your latest blood pressure reading was ${latestBP.value} ${latestBP.unit || ''} on ${latestBP.date}. `;
                
                if (parseInt(latestBP.value) > 140) {
                    response += "This is elevated. Please continue monitoring and take your prescribed medications. Contact your doctor if it remains high.";
                } else {
                    response += "This is within a good range. Keep up with your current treatment plan.";
                }
            } else {
                response = "I don't see recent blood pressure readings in your records. It's important to monitor regularly. Would you like to take a reading now?";
            }
        }
        else if (lowerPrompt.includes('medication') || lowerPrompt.includes('medicine')) {
            if (medications.length > 0) {
                response = `You are currently taking: ${medications.map((m: any) => m.name).join(', ')}. `;
                response += "Please take these as prescribed and don't stop without consulting your doctor.";
            } else {
                response = "I don't see any active medications in your records. Please consult with your healthcare provider about your treatment plan.";
            }
        }
        else if (lowerPrompt.includes('condition') || lowerPrompt.includes('diagnosis')) {
            if (conditions.length > 0) {
                response = `Your diagnosed conditions are: ${conditions.map((c: any) => `${c.name} (${c.clinical_status})`).join(', ')}. `;
                response += "Please follow your treatment plan and attend regular check-ups for these conditions.";
            } else {
                response = "I don't see any diagnosed conditions in your records. Please consult with your healthcare provider for proper diagnosis and treatment.";
            }
        }
        else {
            // General health summary
            response = `Hello ${patient.name}! Based on your health records: `;
            
            if (conditions.length > 0) {
                response += `You have ${conditions.length} condition(s) being managed. `;
            }
            
            if (medications.length > 0) {
                response += `You're taking ${medications.length} medication(s). `;
            }
            
            if (observations.length > 0) {
                response += `Your latest observations show ${observations[observations.length - 1].code}: ${observations[observations.length - 1].value}. `;
            }
            
            response += "How can I help you with your health today? You can tell me about any symptoms you're experiencing, ask what symptoms to expect for your conditions, or ask about your medications and recent observations.";
        }
    }

    return response;
}

export async function POST(request: Request) {
    try {
        const { message, patientId } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        console.log('Enhanced Chat API called with patientId:', patientId, 'message:', message);

        const db = getDbConnection();
        const idToUse = patientId || 'HF000';

        console.log('Using patient ID:', idToUse);

        // 1. Get ALL Patient Data from database
        const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(idToUse) as { id: string; name: string; gender: string; birth_date: string; risk_factors: string } | undefined;
        
        if (!patient) {
            console.log('Patient not found for ID:', idToUse);
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        console.log('Found patient:', patient.name);

        // Get all related data
        const conditions = db.prepare('SELECT * FROM conditions WHERE patient_id = ?').all(idToUse);
        const medications = db.prepare('SELECT * FROM medications WHERE patient_id = ?').all(idToUse);
        const observations = db.prepare('SELECT * FROM observations WHERE patient_id = ? ORDER BY date DESC').all(idToUse);
        const symptoms_history = db.prepare('SELECT * FROM symptoms_history WHERE patient_id = ? ORDER BY date_reported DESC').all(idToUse);
        const medical_notes = db.prepare('SELECT * FROM medical_notes WHERE patient_id = ? ORDER BY created_date DESC').all(idToUse);
        const allergies = db.prepare('SELECT * FROM allergies WHERE patient_id = ?').all(idToUse);

        console.log(`Data loaded - Conditions: ${conditions.length}, Meds: ${medications.length}, Observations: ${observations.length}, Symptoms: ${symptoms_history.length}, Notes: ${medical_notes.length}, Allergies: ${allergies.length}`);

        const patientData = {
            patient,
            conditions,
            medications,
            observations,
            symptoms_history,
            medical_notes,
            allergies
        };

        // 2. Get AI Response using all patient data
        const aiResponseText = await getAIResponse(message, patientData);

        // 3. Log Interaction
        db.prepare('INSERT INTO interactions (patient_id, transcript, ai_response) VALUES (?, ?, ?)').run(idToUse, message, aiResponseText);

        return NextResponse.json({
            transcript: message,
            ai_text: aiResponseText,
            audio_base64: null
        });

    } catch (error: any) {
        console.error('Error in enhanced chat API:', error);
        console.error('Error stack:', error.stack);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
