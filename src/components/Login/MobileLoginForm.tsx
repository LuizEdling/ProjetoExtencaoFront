import image from '../../assets/images/Login/GreenShade.png';

export default function MobileLoginForm() {
  return (
    <div>

      <div className="w-full h-screen flex justify-center items-center relative z-10">
        <div className="w-full max-w-100 p-5 flex flex-col gap-25">
          <header
            className="
            flex gap-3
            items-end justify-center
          "
          >
            <img
              src="/logo.webp"
              alt="Logo do sistema"
              className="w-15 h-15"
            />
            <p className="text-(--green-title) text-[28px] font-extralight font-family-inter">Gerenciador</p>
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
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden">
      
      <img 
        src={image}
        alt="Imagem Login"
        className="
          absolute top-0 left-0
          w-100
          object-cover
          -translate-x-1/2 -translate-y-1/2
        "
      />

      <img 
        src={image}
        alt="Imagem Login"
        className="
          absolute bottom-0 right-0
          w-100
          object-cover
          translate-x-1/2 translate-y-1/2
        "
      />

    </div>
    </div>
  );
};