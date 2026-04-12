import LoginImage from '../../assets/images/Login/login-image.webp';

export default function LoginForm(){
  return(
    <div>
      <div className="w-100 lg:w-40/100 h-screen p-25 flex flex-col gap-25 justify-center">
        <header
          className="
            flex gap-6.25
            items-end
          "
        >
          <img
            src="/logo.webp"
            alt="Logo do sistema"
            className="w-25 h-25"
          />
          <p className="text-(--green-title) text-[38px] font-extralight font-family-inter">Gerenciador</p>
        </header>

        <form className="flex flex-col gap-12.5">
          <div className="flex flex-col">
            <label className="font-extralight">Login ou Email</label>
            <input 
              type="text"
              className="
                border border-(--text-secondary)
                mt-1
                rounded-sm
                h-10
                p-2
                transition-all duration-200

                hover:border-(--green-title)
                focus:outline-none
                focus:border-(--green-title)
                focus:ring-1 focus:ring-(--green-title)

                active:border-(--green-title)
              "
            />
          </div>

          <div className="flex flex-col">
            <label className="font-extralight">Senha</label>
            <input 
              type="password"
              className="
                border border-(--text-secondary)
                mt-1
                rounded-sm
                h-10
                p-2
                transition-all duration-200

                hover:border-(--green-title)
                focus:outline-none
                focus:border-(--green-title)
                focus:ring-1 focus:ring-(--green-title)

                active:border-(--green-title)
              "
              
            />
          </div>

          <div
            className="flex justify-end"
          >
            <button type="submit" className="px-6.25 p-3 bg-(--green-title) rounded-2xl text-white">Entrar</button>
          </div>
        </form>
      </div>
      <div className="absolute bottom-0 right-0 w-[58%] h-screen flex items-end">
      <img 
        src={LoginImage}
        alt="Imagem Login"
        className="w-full h-auto object-contain"
      />
    </div>
    </div>
  );
};