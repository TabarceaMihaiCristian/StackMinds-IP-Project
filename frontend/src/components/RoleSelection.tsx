import { GraduationCap, Users, Shield } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelect: (role: 'student' | 'organizer' | 'admin') => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-indigo-700 text-white px-6 py-4 rounded-t-lg">
          <h1>USV Events</h1>
        </div>
        
        {/* Content */}
        <div className="p-12">
          <h2 className="text-center text-gray-800 mb-12">Selecteaza un rol</h2>
          
          <div className="grid grid-cols-3 gap-8">
            {/* Student Role */}
            <button
              onClick={() => onRoleSelect('student')}
              className="flex flex-col items-center gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <GraduationCap className="w-8 h-8 text-indigo-700" />
              </div>
              <span className="text-gray-800">Student</span>
            </button>
            
            {/* Organizer Role */}
            <button
              onClick={() => onRoleSelect('organizer')}
              className="flex flex-col items-center gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Users className="w-8 h-8 text-indigo-700" />
              </div>
              <span className="text-gray-800">Organizator</span>
            </button>
            
            {/* Admin Role */}
            <button
              onClick={() => onRoleSelect('admin')}
              className="flex flex-col items-center gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Shield className="w-8 h-8 text-indigo-700" />
              </div>
              <span className="text-gray-800">Admin</span>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-indigo-700 h-8 rounded-b-lg"></div>
      </div>
    </div>
  );
}