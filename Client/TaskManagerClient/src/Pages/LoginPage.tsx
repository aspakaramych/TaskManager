import CustomButton from "../Components/CustomButton.tsx";
import {useNavigate} from "react-router";
import {useState} from "react";
import {login} from "../Api/authApi.ts";
import {toast} from 'react-toastify';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            await login(email, password);
            toast.success("Вход выполнен успешно!", {autoClose: 2000});
            setTimeout(() => {
                navigate("/");
            }, 500);

        } catch (error: any) {
            console.error("Login failed:", error);

            let errorMessage = "Произошла неизвестная ошибка при входе.";

            if (error && typeof error.message === 'string') {
                if (error.message === "Validation failed.") {
                    errorMessage = "Ошибка валидации. Проверьте правильность почты и пароля.";
                } else if (error.message === "Authentication failed.") {
                    errorMessage = "Ошибка аутентификации. Неверная почта или пароль.";
                } else {
                    errorMessage = error.message;
                }
            }

            toast.error(errorMessage);
        }
    }

    return (

        <div className="main-container-l">
            <div className="login-container-l">
                <div className='login-text-l'>ЛОГИН</div>

                <div className='email-address-text-l'>ПОЧТА</div>
                <input type="email" className='email-address-input-l' placeholder='АДРЕС ВАШЕЙ ПОЧТЫ'
                       onChange={(e) => setEmail(e.target.value)} value={email}/>

                <div className='password-text-l'>ПАРОЛЬ</div>
                <input type="password" className='password-input-l' placeholder='ВВЕДИТЕ ПАРОЛЬ'
                       onChange={(e) => setPassword(e.target.value)} value={password}/>
                <CustomButton buttonName='login-button-l' buttonText='ВОЙТИ' onClick={handleSubmit}/>
            </div>
            <div className="registration-container-l">
                <div className='join-us-header-l'>НЕТ АККАУНТА?</div>
                <div className='join-us-text-l'>Не проблема! Пройдите регистрацию.
                </div>
                <div className='it-takes-five-minute-l'>Это займёт не больше 5 минут</div>
                <CustomButton buttonName='registration-button-l' buttonText='ЗАРЕГЕСТРИРОВАТЬСЯ'
                              onClick={() => navigate('/register')}/>
            </div>
        </div>
    )
}

export default LoginPage;