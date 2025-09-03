import { Brother, BrotherCardProps, BrotherFull, isBrotherFull } from '@/types/about';
import styles from '../../styles/AboutPage.module.css';

export default function BrotherCard({ brother, achievements, variant }: BrotherCardProps) {
  const showExtended = variant === "full";
  const brotherFull = isBrotherFull(brother);
  
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${styles.brotherCard}`}>
      {/* Foto placeholder */}
      <div className="relative mb-6">
        <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${styles.bgOlive20} ${styles.bgSalvia20} rounded-full flex items-center justify-center mb-4 ${styles.brotherAvatar}`}>
          <svg className={`w-16 h-16 ${styles.textOlive} opacity-60`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <p className={`text-xs text-center ${styles.textNocciola} opacity-60 italic`}>
          Foto: {brother.photo}
        </p>
        
        {/* Badge */}
        <div className={`absolute -top-2 -right-2 ${styles.bgSalvia} ${styles.textBeige} px-2 py-1 rounded-full text-xs font-bold shadow-md`}>
          {brotherFull ? (brother as BrotherFull).age : (brother.id === 1 ? "1°" : brother.id === 2 ? "2°" : "3°")}
        </div>
      </div>

      <div className="text-center space-y-3">
        <h3 className={`text-xl ${styles.fontSerif} ${styles.textOlive} group-hover:${styles.textSalvia} transition-colors duration-300`}>
          {brother.name}
        </h3>
        
        <div className={`text-sm font-medium ${styles.textSalvia} ${styles.bgSalvia10} px-3 py-1 rounded-full inline-block`}>
          {brother.role}
        </div>
        
        <p className={`text-sm ${styles.textNocciola} leading-relaxed`}>
          {brother.description}
        </p>
        
        <div className={`text-xs ${styles.textNocciola} opacity-80 italic border-t ${styles.borderOlive10} pt-3`}>
          {brother.speciality}
        </div>
        
        {/* Dettagli estesi solo per AboutPage */}
        {showExtended && brotherFull && (
          <p className={`text-xs ${styles.textNocciola} leading-relaxed`}>
            {(brother as BrotherFull).details}
          </p>
        )}
        
        {/* Achievements solo per AboutPage */}
        {showExtended && brotherFull && achievements && (
          <div className="space-y-2">
            <div className={`text-xs font-medium ${styles.textOlive}`}>{achievements}</div>
            <div className="grid grid-cols-1 gap-1">
              {(brother as BrotherFull).achievements.map((achievement, i) => (
                <div key={i} className={`text-xs ${styles.textNocciola} ${styles.bgOlive5} px-2 py-1 rounded`}>
                  {achievement}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <blockquote className={`text-sm ${styles.textOlive} italic ${styles.bgOlive5} p-3 rounded-lg border-l-4 ${styles.borderOlive}`}>
          "{brother.quote}"
        </blockquote>
      </div>
    </div>
  );
}