import {useState} from "react";
import {useNavigate} from "react-router";
import {toast} from "react-toastify";
import CustomButton from "../Components/CustomButton.tsx";
import {useAuth} from "../hooks/useAuth.ts";

function RegistryPage(){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const {register} = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const registrationData = {
                username,
                email,
                password,
                firstName,
                lastName,
            };


            await register(registrationData);

            toast.success("Регистрация прошла успешно! Теперь выполните вход.", { autoClose: 3000 });

            setTimeout(() => {
                navigate('/');
            }, 500);

        } catch (error: any) {
            console.error("Registration failed:", error);

            let errorMessage = "Произошла неизвестная ошибка при регистрации.";

            if (error && typeof error.message === 'string') {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    }

    return (
        <div className="main-container-r">
            <div className="registration-container-r">
                <div className='registration-text-r'>РЕГИСТРАЦИЯ</div>

                <div className='username-r'>ИМЯ ПОЛЬЗОВАТЕЛЯ</div>
                <input type="text" className='username-input-r' placeholder='USERNAME'
                       onChange={(e) => setUsername(e.target.value)} value={username}/>

                <div className='email-address-text-r'>ПОЧТА</div>
                <input type="text" className='email-address-input-r' placeholder='EMAIL'
                       onChange={(e) => setEmail(e.target.value)} value={email}/>

                <div className='password-text-r'>ПАРОЛЬ</div>
                <input type="password" className='password-input-r' placeholder='PASSWORD'
                       onChange={(e) => setPassword(e.target.value)} value={password}/>

                <div className='firstname-r'>ИМЯ</div>
                <input type="text" className='firstname-input-r' placeholder='FIRSTNAME'
                       onChange={(e) => setFirstName(e.target.value)} value={firstName}/>

                <div className='lastname-r'>ФАМИЛИЯ</div>
                <input type="text" className='lastname-input-r' placeholder='LASTNAME'
                       onChange={(e) => setLastName(e.target.value)} value={lastName}/>


                <CustomButton buttonName='registration-button-r' buttonText='ЗАРЕГЕСТРИРОВАТЬСЯ' onClick={handleSubmit}/>
            </div>
            <div className="login-container-r">
                <div className='join-us-header-r'>УЖЕ ЕСТЬ АККАУНТ?</div>
                <div className='join-us-text-r'>Отлично! Вы можете выполнить вход, указав свою почту и пароль</div>
                <CustomButton buttonName='login-button-r' buttonText='ВОЙТИ' onClick={() => navigate('/login')}/>
            </div>
        </div>
    )
}

export default RegistryPage;