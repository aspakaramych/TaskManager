interface ButtonProp {
    buttonName: string;
    onClick: () => void;
    buttonText: string;
}

function CustomButton(buttonProperties : ButtonProp) {
    return (
        <div className={buttonProperties.buttonName}
             onClick={buttonProperties.onClick}>
            {buttonProperties.buttonText}
        </div>
    )
}

export default CustomButton;