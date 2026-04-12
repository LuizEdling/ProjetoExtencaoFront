import LoginImage from '../../assets/images/Login/login-image.webp';

export default function LoginDesktopBanner(){
  return(
    <div className="absolute bottom-0 right-0 w-[58%] h-screen flex items-end">
      <img 
        src={LoginImage}
        alt="Imagem Login"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}