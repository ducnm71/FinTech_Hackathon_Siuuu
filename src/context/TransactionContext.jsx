
import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/APIRoutes";
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { db } from "../firebase/config";
import { AuthContext } from "./AuthContext";
export const TransactionContext = React.createContext();
const { ethereum } = window;

const createEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    
    return transactionsContract;
};


export const TransactionsProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [currentUser, setCurrentUser] = useState(null)
    const [formData, setformData] = useState({ addressTo: "", amount: "", message: "" });
    //const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);

    const getAllTransactions = async () => {
        try {
          if (ethereum) {
            const transactionsContract = createEthereumContract();
    
            const availableTransactions = await transactionsContract.getAllTransactions();
    
            const structuredTransactions = availableTransactions.map((transaction) => ({
              addressTo: transaction.receiver,
              addressFrom: transaction.sender,
              timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
              message: transaction.message,
              amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
    
            console.log(structuredTransactions);
    
            setTransactions(structuredTransactions);
          } else {
            console.log("Ethereum is not present");
          }
        } catch (error) {
          console.log(error);
        }
      };

    const checkIfWalletIsConnect = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                console.log(currentAccount)
                getAllTransactions();
            } else {
                console.log("No accounts found");
            }
            console.log(accounts)
        } catch (error) {
            console.log(error);
        }
    };
    
    const connectWallet = async ({currentUser, card}) => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_requestAccounts", });
                       
                if(!card) {

                    await updateDoc(doc(db, "users", currentUser.uid), {
                        "numbercard": {
                            cardNumber: accounts[0]
                        }
                    });
                } 
                setCurrentAccount(accounts[0]);
                console.log(accounts[0]);
                // window.location.reload()
                
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    };

   
    const sendTransaction = async ({values, setIsLoading}) => {
        try {
            if (ethereum) {
                const { addressTo, amount, message } = values;
                console.log(values)
                const transactionsContract = createEthereumContract();
                const parsedAmount = ethers.utils.parseEther(amount);

                await ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: currentAccount,
                        to: addressTo,
                        gas: "0x5208",
                        value: parsedAmount._hex,
                    }],
                });
                const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message);

                setIsLoading(true);
                console.log(`Loading - ${transactionHash.hash}`);
                await transactionHash.wait();
                console.log(`Success - ${transactionHash.hash}`);

                const transactionsCount = await transactionsContract.getTransactionCount();
                setTransactionCount(transactionsCount.toNumber());
                setIsLoading(false)
            }
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnect();
    }, []);
    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, sendTransaction, transactions }}>
            {children}
        </TransactionContext.Provider>
    )

}