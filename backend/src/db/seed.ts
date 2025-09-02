import { db } from './db_index.js';
import {
  usersTable,
  roleInfoTable,
  userRolesTable,
  hospitalTable,
  specializationsTable,
  hospitalSpecializationsTable,
  hospitalEmployeesTable,
  doctorInfoTable,
  doctorSpecializationsTable,
  doctorSecretariesTable,
  doctorAvailabilityTable,
  tokenInfoTable,
  runningCounterTable
} from './schema.js';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data (if needed)
    // Uncomment these lines if you want to clear the tables before seeding
    // This deletes in reverse order to respect foreign key constraints
    /*
    await db.delete(runningCounterTable);
    await db.delete(tokenInfoTable);
    await db.delete(doctorAvailabilityTable);
    await db.delete(doctorSecretariesTable);
    await db.delete(doctorSpecializationsTable);
    await db.delete(doctorInfoTable);
    await db.delete(hospitalEmployeesTable);
    await db.delete(hospitalSpecializationsTable);
    await db.delete(specializationsTable);
    await db.delete(hospitalTable);
    await db.delete(userRolesTable);
    await db.delete(roleInfoTable);
    await db.delete(usersTable);
    */

    // 1. Insert roles
    console.log('Inserting roles...');
    const roleIds = await db.insert(roleInfoTable)
      .values([
        { name: 'Admin', description: 'System administrator with full access' },
        { name: 'Doctor', description: 'Medical professional who can manage patients' },
        { name: 'Secretary', description: 'Assists doctors with appointments and scheduling' },
        { name: 'Patient', description: 'A person who receives medical treatment' },
        { name: 'Staff', description: 'General hospital staff' }
      ])
      .returning({ id: roleInfoTable.id, name: roleInfoTable.name });
    
    
    // Create a map of role names to role IDs
    const roleMap = new Map<string, number>();
    roleIds.forEach(role => {
      roleMap.set(role.name, role.id);
    });

    // 2. Insert users
    console.log('Inserting users...');
    const userIds = await db.insert(usersTable)
      .values([
        { 
          name: 'Admin User', 
          email: 'admin@healthpetal.com', 
          mobile: '9876543210', 
          address: '123 Admin Street, City',
          profilePicUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        { 
          name: 'Dr. John Smith', 
          email: 'john.smith@healthpetal.com', 
          mobile: '9876543211', 
          address: '456 Doctor Avenue, City',
          profilePicUrl: 'https://randomuser.me/api/portraits/men/2.jpg'
        },
        { 
          name: 'Dr. Sarah Johnson', 
          email: 'sarah.johnson@healthpetal.com', 
          mobile: '9876543212', 
          address: '789 Medical Road, City',
          profilePicUrl: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        { 
          name: 'Mary Secretary', 
          email: 'mary@healthpetal.com', 
          mobile: '9876543213', 
          address: '101 Secretary Lane, City',
          profilePicUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        { 
          name: 'Patient One', 
          email: 'patient1@example.com', 
          mobile: '9876543214', 
          address: '202 Patient Street, City',
          profilePicUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
        },
        { 
          name: 'Patient Two', 
          email: 'patient2@example.com', 
          mobile: '9876543215', 
          address: '303 Patient Avenue, City',
          profilePicUrl: 'https://randomuser.me/api/portraits/women/3.jpg'
        },
        { 
          name: 'Staff Member', 
          email: 'staff@healthpetal.com', 
          mobile: '9876543216', 
          address: '404 Staff Boulevard, City',
          profilePicUrl: 'https://randomuser.me/api/portraits/men/4.jpg'
        }
      ])
      .returning({ id: usersTable.id, name: usersTable.name });
    
    console.log('Users inserted:', userIds);
    
    // Create a map of user names to user IDs
    const userMap = new Map<string, number>();
    userIds.forEach(user => {
      userMap.set(user.name, user.id);
    });

    // 3. Assign roles to users
    console.log('Assigning roles to users...');
    await db.insert(userRolesTable)
      .values([
        { userId: userMap.get('Admin User')!, roleId: roleMap.get('Admin')! },
        { userId: userMap.get('Dr. John Smith')!, roleId: roleMap.get('Doctor')! },
        { userId: userMap.get('Dr. Sarah Johnson')!, roleId: roleMap.get('Doctor')! },
        { userId: userMap.get('Mary Secretary')!, roleId: roleMap.get('Secretary')! },
        { userId: userMap.get('Patient One')!, roleId: roleMap.get('Patient')! },
        { userId: userMap.get('Patient Two')!, roleId: roleMap.get('Patient')! },
        { userId: userMap.get('Staff Member')!, roleId: roleMap.get('Staff')! }
      ]);

    // 4. Insert hospitals
    console.log('Inserting hospitals...');
    const hospitalIds = await db.insert(hospitalTable)
      .values([
        { 
          name: 'HealthPetal General Hospital', 
          address: '1000 Hospital Drive, Medical City',
          description: 'A premier healthcare facility offering comprehensive medical services.'
        },
        { 
          name: 'HealthPetal Specialty Clinic', 
          address: '2000 Specialist Road, Medical City',
          description: 'A specialized clinic focusing on advanced medical treatments.'
        }
      ])
      .returning({ id: hospitalTable.id, name: hospitalTable.name });
    
    console.log('Hospitals inserted:', hospitalIds);
    
    // Create a map of hospital names to hospital IDs
    const hospitalMap = new Map<string, number>();
    hospitalIds.forEach(hospital => {
      hospitalMap.set(hospital.name, hospital.id);
    });

    // 5. Insert specializations
    console.log('Inserting specializations...');
    const specializationIds = await db.insert(specializationsTable)
      .values([
        { name: 'Cardiology', description: 'Diagnosis and treatment of heart diseases' },
        { name: 'Neurology', description: 'Diagnosis and treatment of nervous system disorders' },
        { name: 'Orthopedics', description: 'Diagnosis and treatment of musculoskeletal disorders' },
        { name: 'Pediatrics', description: 'Medical care of infants, children, and adolescents' },
        { name: 'Dermatology', description: 'Diagnosis and treatment of skin disorders' }
      ])
      .returning({ id: specializationsTable.id, name: specializationsTable.name });
    
    console.log('Specializations inserted:', specializationIds);
    
    // Create a map of specialization names to specialization IDs
    const specializationMap = new Map<string, number>();
    specializationIds.forEach(specialization => {
      specializationMap.set(specialization.name, specialization.id);
    });

    // 6. Link hospitals with specializations
    console.log('Linking hospitals with specializations...');
    await db.insert(hospitalSpecializationsTable)
      .values([
        { hospitalId: hospitalMap.get('HealthPetal General Hospital')!, specializationId: specializationMap.get('Cardiology')! },
        { hospitalId: hospitalMap.get('HealthPetal General Hospital')!, specializationId: specializationMap.get('Neurology')! },
        { hospitalId: hospitalMap.get('HealthPetal General Hospital')!, specializationId: specializationMap.get('Orthopedics')! },
        { hospitalId: hospitalMap.get('HealthPetal General Hospital')!, specializationId: specializationMap.get('Pediatrics')! },
        { hospitalId: hospitalMap.get('HealthPetal Specialty Clinic')!, specializationId: specializationMap.get('Cardiology')! },
        { hospitalId: hospitalMap.get('HealthPetal Specialty Clinic')!, specializationId: specializationMap.get('Dermatology')! }
      ]);

    // 7. Add hospital employees
    console.log('Adding hospital employees...');
    await db.insert(hospitalEmployeesTable)
      .values([
        { 
          hospitalId: hospitalMap.get('HealthPetal General Hospital')!, 
          userId: userMap.get('Dr. John Smith')!,
          designation: 'Senior Physician'
        },
        { 
          hospitalId: hospitalMap.get('HealthPetal Specialty Clinic')!, 
          userId: userMap.get('Dr. Sarah Johnson')!,
          designation: 'Specialist'
        },
        { 
          hospitalId: hospitalMap.get('HealthPetal General Hospital')!, 
          userId: userMap.get('Mary Secretary')!,
          designation: 'Administrative Assistant'
        },
        { 
          hospitalId: hospitalMap.get('HealthPetal General Hospital')!, 
          userId: userMap.get('Staff Member')!,
          designation: 'Nurse'
        }
      ]);

    // 8. Insert doctor info
    console.log('Inserting doctor info...');
    const doctorInfoIds = await db.insert(doctorInfoTable)
      .values([
        { 
          userId: userMap.get('Dr. John Smith')!, 
          qualifications: 'MD, MBBS, Cardiology Specialist',
          dailyTokenCount: 20
        },
        { 
          userId: userMap.get('Dr. Sarah Johnson')!, 
          qualifications: 'MD, MBBS, PhD Neurology',
          dailyTokenCount: 15
        }
      ])
      .returning({ id: doctorInfoTable.id, userId: doctorInfoTable.userId });
    
    console.log('Doctor info inserted:', doctorInfoIds);
    
    // Create a map of doctor user IDs to doctor info IDs
    const doctorInfoMap = new Map<number, number>();
    doctorInfoIds.forEach(doctorInfo => {
      doctorInfoMap.set(doctorInfo.userId, doctorInfo.id);
    });

    // 9. Link doctors with specializations
    console.log('Linking doctors with specializations...');
    await db.insert(doctorSpecializationsTable)
      .values([
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. John Smith')!)!, 
          specializationId: specializationMap.get('Cardiology')!
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. John Smith')!)!, 
          specializationId: specializationMap.get('Pediatrics')!
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. Sarah Johnson')!)!, 
          specializationId: specializationMap.get('Neurology')!
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. Sarah Johnson')!)!, 
          specializationId: specializationMap.get('Dermatology')!
        }
      ]);

    // 10. Assign secretaries to doctors
    console.log('Assigning secretaries to doctors...');
    await db.insert(doctorSecretariesTable)
      .values([
        { 
          doctorId: userMap.get('Dr. John Smith')!, 
          secretaryId: userMap.get('Mary Secretary')!
        },
        { 
          doctorId: userMap.get('Dr. Sarah Johnson')!, 
          secretaryId: userMap.get('Mary Secretary')!
        }
      ]);

    // 11. Create doctor availability
    console.log('Creating doctor availability...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    const availabilityIds = await db.insert(doctorAvailabilityTable)
      .values([
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. John Smith')!)!, 
          date: formatDate(today),
          totalTokenCount: 20,
          filledTokenCount: 10,
          isStopped: false
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. John Smith')!)!, 
          date: formatDate(tomorrow),
          totalTokenCount: 20,
          filledTokenCount: 5,
          isStopped: false
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. Sarah Johnson')!)!, 
          date: formatDate(today),
          totalTokenCount: 15,
          filledTokenCount: 8,
          isStopped: false
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. Sarah Johnson')!)!, 
          date: formatDate(dayAfterTomorrow),
          totalTokenCount: 15,
          filledTokenCount: 0,
          isStopped: false
        }
      ])
      .returning({ id: doctorAvailabilityTable.id, doctorId: doctorAvailabilityTable.doctorId, date: doctorAvailabilityTable.date });
    
    console.log('Doctor availability created:', availabilityIds);

    // 12. Insert token info (appointments)
    console.log('Creating token info (appointments)...');
    await db.insert(tokenInfoTable)
      .values([
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. John Smith')!)!, 
          userId: userMap.get('Patient One')!,
          tokenDate: formatDate(today),
          queueNum: 1,
          description: 'Regular checkup'
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. John Smith')!)!, 
          userId: userMap.get('Patient Two')!,
          tokenDate: formatDate(today),
          queueNum: 2,
          description: 'Follow-up visit'
        },
        { 
          doctorId: doctorInfoMap.get(userMap.get('Dr. Sarah Johnson')!)!, 
          userId: userMap.get('Patient One')!,
          tokenDate: formatDate(today),
          queueNum: 1,
          description: 'Consultation for headaches'
        }
      ]);

    // 13. Create running counters
    console.log('Creating running counters...');
    await db.insert(runningCounterTable)
      .values([
        { 
          date: formatDate(today),
          doctorId: doctorInfoMap.get(userMap.get('Dr. John Smith')!)!,
          count: 5
        },
        { 
          date: formatDate(today),
          doctorId: doctorInfoMap.get(userMap.get('Dr. Sarah Johnson')!)!,
          count: 3
        }
      ]);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}


export default seed;