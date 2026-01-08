from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from ..database.db import get_database
from ..utils.auth_middleware import get_current_user
import os
import uuid
import shutil

router = APIRouter(prefix="/api/retail-services", tags=["Retail Services - FormData"])


# Helper function for file upload
def save_retail_document(file: UploadFile, application_id: str, doc_type: str) -> str:
    """Save uploaded document and return file path"""
    try:
        # Use absolute path for uploads directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_dir = os.path.join(base_dir, "uploads", "retail_services", application_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        print(f"📁 Upload directory: {upload_dir}")
        
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{doc_type}_{uuid.uuid4().hex[:8]}{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        print(f"💾 Saving file: {file_path}")
        
        # Reset file pointer to beginning
        file.file.seek(0)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Verify file was saved
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            print(f"✅ File saved successfully: {file_size} bytes")
        else:
            print(f"❌ File save verification failed!")
            
        return file_path
    except Exception as e:
        print(f"❌ File upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


# ===================== ITR FILING SERVICE =====================

@router.post("/itr-filing")
async def submit_itr_filing(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    aadhaarNumber: str = Form(...),
    dateOfBirth: str = Form(...),
    employmentType: str = Form(...),
    annualIncome: str = Form(...),
    itrType: str = Form(...),
    hasBusinessIncome: str = Form("false"),
    hasCapitalGains: str = Form("false"),
    hasHouseProperty: str = Form("false"),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    panCard: UploadFile = File(None),
    aadhaarCard: UploadFile = File(None),
    form16: UploadFile = File(None),
    bankStatement: UploadFile = File(None),
    investmentProofs: UploadFile = File(None)
):
    """Submit ITR Filing Application with file uploads"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"ITR{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "itr-filing",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "full_name": fullName,
                "email": email,
                "phone": phone,
                "pan_number": panNumber,
                "aadhaar_number": aadhaarNumber,
                "date_of_birth": dateOfBirth,
                "employment_type": employmentType,
                "annual_income": annualIncome,
                "itr_type": itrType,
                "has_business_income": hasBusinessIncome.lower() == "true",
                "has_capital_gains": hasCapitalGains.lower() == "true",
                "has_house_property": hasHouseProperty.lower() == "true",
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        # Handle file uploads
        doc_mapping = {
            "pan_card": panCard,
            "aadhaar_card": aadhaarCard,
            "form16": form16,
            "bank_statement": bankStatement,
            "investment_proofs": investmentProofs
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "ITR Filing application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "itr-filing",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"ITR Filing Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== ITR REVISION SERVICE =====================

@router.post("/itr-revision")
async def submit_itr_revision(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    assessmentYear: str = Form(...),
    itrType: str = Form(...),
    acknowledgmentNumber: str = Form(...),
    originalFilingDate: str = Form(...),
    revisionReason: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    originalITR: UploadFile = File(None),
    acknowledgmentReceipt: UploadFile = File(None),
    supportingDocuments: UploadFile = File(None),
    revisedComputations: UploadFile = File(None),
    form26AS: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Submit ITR Revision Application with authentication"""
    try:
        print(f"[ITR REVISION] Processing submission for {email}")
        
        # Validate required fields
        if not all([fullName, email, phone, panNumber, assessmentYear, itrType, 
                   acknowledgmentNumber, originalFilingDate, revisionReason, address, city, state, pincode]):
            print(f"[ITR REVISION] Missing required fields")
            raise HTTPException(status_code=400, detail="All fields are required")
        
        # Validate required documents  
        if not originalITR:
            print(f"[ITR REVISION] Missing originalITR document")
            raise HTTPException(status_code=400, detail="Original ITR document is required")
        if not acknowledgmentReceipt:
            print(f"[ITR REVISION] Missing acknowledgmentReceipt document")
            raise HTTPException(status_code=400, detail="Acknowledgment Receipt is required")
        
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"ITRREV{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        # Get user ID from current_user
        user_id = current_user.get("user_id") if isinstance(current_user, dict) else str(current_user)
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "itr-revision",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "userId": user_id,
            "applicationData": {
                "full_name": fullName,
                "email": email,
                "phone": phone,
                "pan_number": panNumber,
                "assessment_year": assessmentYear,
                "itr_type": itrType,
                "acknowledgment_number": acknowledgmentNumber,
                "original_filing_date": originalFilingDate,
                "revision_reason": revisionReason,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        # Handle file uploads
        doc_mapping = {
            "original_itr": originalITR,
            "acknowledgment_receipt": acknowledgmentReceipt,
            "supporting_documents": supportingDocuments,
            "revised_computations": revisedComputations,
            "form26as": form26AS
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                try:
                    file_path = save_retail_document(file, application_id, doc_name)
                    application_data["documents"][doc_name] = file_path
                    print(f"[ITR REVISION] Uploaded {doc_name}: {file_path}")
                except Exception as e:
                    print(f"[ITR REVISION] Error uploading {doc_name}: {str(e)}")
                    raise HTTPException(status_code=400, detail=f"Failed to upload {doc_name}: {str(e)}")
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "ITR Revision application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "itr-revision",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        print(f"[ITR REVISION] Application {application_id} submitted successfully")
        return JSONResponse(content=response_data, status_code=201)
        
    except HTTPException as e:
        print(f"[ITR REVISION] HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        print(f"[ITR REVISION] Unexpected Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# ===================== ITR NOTICE REPLY SERVICE =====================

@router.post("/itr-notice-reply")
async def submit_itr_notice_reply(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    noticeType: str = Form(...),
    noticeDate: str = Form(...),
    assessmentYear: str = Form(...),
    noticeReferenceNumber: str = Form(...),
    cpcOrAO: str = Form(...),
    noticeDetails: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    noticeCopy: UploadFile = File(None),
    itrCopy: UploadFile = File(None),
    form26AS: UploadFile = File(None),
    supportingDocuments: UploadFile = File(None),
    correspondence: UploadFile = File(None)
):
    """Submit ITR Notice Reply Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"ITRNOTICE{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "itr-notice-reply",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "full_name": fullName,
                "email": email,
                "phone": phone,
                "pan_number": panNumber,
                "notice_type": noticeType,
                "notice_date": noticeDate,
                "assessment_year": assessmentYear,
                "notice_reference_number": noticeReferenceNumber,
                "cpc_or_ao": cpcOrAO,
                "notice_details": noticeDetails,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        # Handle file uploads
        doc_mapping = {
            "notice_copy": noticeCopy,
            "itr_copy": itrCopy,
            "form26as": form26AS,
            "supporting_documents": supportingDocuments,
            "correspondence": correspondence
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "ITR Notice Reply application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "itr-notice-reply",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"ITR Notice Reply Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Add more endpoints for other services...
# I'll continue with the remaining endpoints in the same pattern


# ===================== INDIVIDUAL PAN SERVICE =====================

@router.post("/individual-pan")
async def submit_individual_pan(
    fullName: str = Form(...),
    fatherName: str = Form(...),
    dateOfBirth: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    aadhaarNumber: str = Form(...),
    gender: str = Form(...),
    category: str = Form(...),
    applicationType: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    photograph: UploadFile = File(None),
    aadhaarCard: UploadFile = File(None),
    addressProof: UploadFile = File(None),
    identityProof: UploadFile = File(None),
    dobProof: UploadFile = File(None)
):
    """Submit Individual PAN Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"PAN{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "individual-pan",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "full_name": fullName,
                "father_name": fatherName,
                "date_of_birth": dateOfBirth,
                "email": email,
                "phone": phone,
                "aadhaar_number": aadhaarNumber,
                "gender": gender,
                "category": category,
                "application_type": applicationType,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        # Handle file uploads
        doc_mapping = {
            "photograph": photograph,
            "aadhaar_card": aadhaarCard,
            "address_proof": addressProof,
            "identity_proof": identityProof,
            "dob_proof": dobProof
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "Individual PAN application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "individual-pan",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"Individual PAN Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== HUF PAN SERVICE =====================

@router.post("/huf-pan")
async def submit_huf_pan(
    kartaName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    kartaPAN: str = Form(...),
    hufName: str = Form(...),
    familyMembers: str = Form(...),
    formationDate: str = Form(...),
    hufPurpose: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    kartaAadhaar: UploadFile = File(None),
    kartaPhoto: UploadFile = File(None),
    familyList: UploadFile = File(None),
    hufDeed: UploadFile = File(None),
    addressProof: UploadFile = File(None)
):
    """Submit HUF PAN Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"HUFPAN{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "huf-pan",
            "applicantName": hufName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "karta_name": kartaName,
                "email": email,
                "phone": phone,
                "karta_pan": kartaPAN,
                "huf_name": hufName,
                "family_members": familyMembers,
                "formation_date": formationDate,
                "huf_purpose": hufPurpose,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        doc_mapping = {
            "karta_aadhaar": kartaAadhaar,
            "karta_photo": kartaPhoto,
            "family_list": familyList,
            "huf_deed": hufDeed,
            "address_proof": addressProof
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "HUF PAN application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "huf-pan",
                "applicantName": kartaName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"HUF PAN Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== PF WITHDRAWAL SERVICE =====================

@router.post("/pf-withdrawal")
async def submit_pf_withdrawal(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    uanNumber: str = Form(...),
    employerName: str = Form(...),
    withdrawalType: str = Form(...),
    withdrawalAmount: str = Form(...),
    withdrawalReason: str = Form(...),
    lastWorkingDate: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    form19: UploadFile = File(None),
    form10C: UploadFile = File(None),
    aadhaarCard: UploadFile = File(None),
    bankPassbook: UploadFile = File(None),
    cheque: UploadFile = File(None)
):
    """Submit PF Withdrawal Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"PF{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "pf-withdrawal",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "full_name": fullName,
                "email": email,
                "phone": phone,
                "pan_number": panNumber,
                "uan_number": uanNumber,
                "employer_name": employerName,
                "withdrawal_type": withdrawalType,
                "withdrawal_amount": withdrawalAmount,
                "withdrawal_reason": withdrawalReason,
                "last_working_date": lastWorkingDate,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        doc_mapping = {
            "form19": form19,
            "form10c": form10C,
            "aadhaar_card": aadhaarCard,
            "bank_passbook": bankPassbook,
            "cheque": cheque
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "PF Withdrawal application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "pf-withdrawal",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"PF Withdrawal Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== DOCUMENT UPDATE SERVICE =====================

@router.post("/document-update")
async def submit_document_update(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    aadhaarNumber: str = Form(...),
    panNumber: str = Form(...),
    updateType: str = Form(...),
    currentAddress: str = Form(None),
    newAddress: str = Form(None),
    updateReason: str = Form(...),
    dateOfBirth: str = Form(None),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    aadhaarCard: UploadFile = File(None),
    panCard: UploadFile = File(None),
    addressProof: UploadFile = File(None),
    photograph: UploadFile = File(None),
    dobProof: UploadFile = File(None)
):
    """Submit Document Update Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"DOC{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "document-update",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "full_name": fullName,
                "email": email,
                "phone": phone,
                "aadhaar_number": aadhaarNumber,
                "pan_number": panNumber,
                "update_type": updateType,
                "current_address": currentAddress,
                "new_address": newAddress,
                "update_reason": updateReason,
                "date_of_birth": dateOfBirth,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        doc_mapping = {
            "aadhaar_card": aadhaarCard,
            "pan_card": panCard,
            "address_proof": addressProof,
            "photograph": photograph,
            "dob_proof": dobProof
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "Document Update application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "document-update",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"Document Update Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Continue in next part...


# ===================== TRADING & DEMAT SERVICE =====================

@router.post("/trading-demat")
async def submit_trading_demat(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    aadhaarNumber: str = Form(...),
    dateOfBirth: str = Form(...),
    accountType: str = Form(...),
    tradingSegments: str = Form(...),  # Will be comma-separated string
    annualIncome: str = Form(...),
    occupationType: str = Form(...),
    experienceLevel: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    bankName: str = Form(...),
    accountNumber: str = Form(...),
    ifscCode: str = Form(...),
    panCard: UploadFile = File(None),
    aadhaarCard: UploadFile = File(None),
    photo: UploadFile = File(None),
    signature: UploadFile = File(None),
    bankProof: UploadFile = File(None)
):
    """Submit Trading & Demat Account Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"DEMAT{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "trading-demat",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "full_name": fullName,
                "email": email,
                "phone": phone,
                "pan_number": panNumber,
                "aadhaar_number": aadhaarNumber,
                "date_of_birth": dateOfBirth,
                "account_type": accountType,
                "trading_segments": tradingSegments.split(',') if tradingSegments else [],
                "annual_income": annualIncome,
                "occupation_type": occupationType,
                "experience_level": experienceLevel,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode,
                "bank_name": bankName,
                "account_number": accountNumber,
                "ifsc_code": ifscCode
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        doc_mapping = {
            "pan_card": panCard,
            "aadhaar_card": aadhaarCard,
            "photo": photo,
            "signature": signature,
            "bank_proof": bankProof
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "Trading & Demat application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "trading-demat",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"Trading & Demat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== BANK ACCOUNT SERVICE =====================

@router.post("/bank-account")
async def submit_bank_account(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    aadhaarNumber: str = Form(...),
    dateOfBirth: str = Form(...),
    accountType: str = Form(...),
    bankPreference: str = Form(...),
    accountVariant: str = Form(...),
    monthlyIncome: str = Form(...),
    occupationType: str = Form(...),
    nomineeRequired: str = Form("false"),
    nomineeName: str = Form(None),
    nomineeRelation: str = Form(None),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    residenceType: str = Form(...),
    panCard: UploadFile = File(None),
    aadhaarCard: UploadFile = File(None),
    photo: UploadFile = File(None),
    signature: UploadFile = File(None),
    addressProof: UploadFile = File(None)
):
    """Submit Bank Account Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"BANK{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "bank-account",
            "applicantName": fullName,
            "email": email,
            "phone": phone,
            "applicationData": {
                "full_name": fullName,
                "email": email,
                "phone": phone,
                "pan_number": panNumber,
                "aadhaar_number": aadhaarNumber,
                "date_of_birth": dateOfBirth,
                "account_type": accountType,
                "bank_preference": bankPreference,
                "account_variant": accountVariant,
                "monthly_income": monthlyIncome,
                "occupation_type": occupationType,
                "nominee_required": nomineeRequired.lower() == "true",
                "nominee_name": nomineeName,
                "nominee_relation": nomineeRelation,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode,
                "residence_type": residenceType
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        doc_mapping = {
            "pan_card": panCard,
            "aadhaar_card": aadhaarCard,
            "photo": photo,
            "signature": signature,
            "address_proof": addressProof
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "Bank Account application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "bank-account",
                "applicantName": fullName,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"Bank Account Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== FINANCIAL PLANNING SERVICE =====================

@router.post("/financial-planning")
async def submit_financial_planning(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: str = Form(...),
    occupation: str = Form(...),
    annualIncome: str = Form(...),
    existingInvestments: str = Form(...),
    riskProfile: str = Form(...),
    investmentGoal: str = Form(...),
    timeHorizon: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    panNumber: str = Form(...),
    panCard: UploadFile = File(None),
    aadharCard: UploadFile = File(None),
    salarySlips: UploadFile = File(None),
    bankStatements: UploadFile = File(None),
    investmentProofs: UploadFile = File(None)
):
    """Submit Financial Planning Application"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        application_id = f"FP{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        application_data = {
            "applicationId": application_id,
            "serviceType": "financial-planning",
            "applicantName": name,
            "email": email,
            "phone": phone,
            "applicationData": {
                "name": name,
                "email": email,
                "phone": phone,
                "age": age,
                "occupation": occupation,
                "annual_income": annualIncome,
                "existing_investments": existingInvestments,
                "risk_profile": riskProfile,
                "investment_goal": investmentGoal,
                "time_horizon": timeHorizon,
                "address": address,
                "city": city,
                "state": state,
                "pincode": pincode,
                "pan_number": panNumber
            },
            "status": "pending",
            "documents": {},
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        doc_mapping = {
            "pan_card": panCard,
            "aadhar_card": aadharCard,
            "salary_slips": salarySlips,
            "bank_statements": bankStatements,
            "investment_proofs": investmentProofs
        }
        
        for doc_name, file in doc_mapping.items():
            if file and file.filename:
                file_path = save_retail_document(file, application_id, doc_name)
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        
        # Prepare response with complete application data
        response_data = {
            "success": True,
            "message": "Financial Planning application submitted successfully",
            "applicationId": application_id,
            "status": "pending",
            "application": {
                "id": str(result.inserted_id),
                "applicationId": application_id,
                "serviceType": "financial-planning",
                "applicantName": name,
                "email": email,
                "phone": phone,
                "applicationData": application_data["applicationData"],
                "documents": application_data["documents"],
                "status": "pending",
                "createdAt": application_data["createdAt"].isoformat(),
                "updatedAt": application_data["updatedAt"].isoformat()
            }
        }
        
        return JSONResponse(content=response_data, status_code=201)
        
    except Exception as e:
        print(f"Financial Planning Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== ADMIN ENDPOINTS =====================

@router.get("/admin/applications")
async def get_all_retail_applications(
    service_type: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all retail service applications for admin panel"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceApplications"]
        
        # Build query
        query = {}
        if service_type:
            query["serviceType"] = service_type
        if status:
            query["status"] = status.lower()
        
        # Fetch applications
        applications = list(collection.find(query).sort("createdAt", -1))
        
        # Transform data for frontend
        result = []
        for app in applications:
            result.append({
                "id": str(app.get("_id")),
                "_id": str(app.get("_id")),
                "application_id": app.get("applicationId", "N/A"),
                "name": app.get("applicantName", "N/A"),
                "email": app.get("email", "N/A"),
                "phone": app.get("phone", "N/A"),
                "service_type": app.get("serviceType", "N/A"),
                "status": app.get("status", "pending").title(),
                "created_at": app.get("createdAt").isoformat() if app.get("createdAt") else None,
                "updated_at": app.get("updatedAt").isoformat() if app.get("updatedAt") else None,
                "documents": list(app.get("documents", {}).keys()) if app.get("documents") else [],
                "application_data": app.get("applicationData", {})
            })
        
        return JSONResponse(content=result, status_code=200)
        
    except Exception as e:
        print(f"Error fetching applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/applications/{application_id}")
async def get_retail_application_by_id(application_id: str):
    """Get specific retail service application by ID"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceApplications"]
        
        # Try to find by MongoDB _id first
        try:
            application = collection.find_one({"_id": ObjectId(application_id)})
        except:
            # If ObjectId fails, try to find by applicationId field
            application = collection.find_one({"applicationId": application_id})
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Transform data
        result = {
            "id": str(application.get("_id")),
            "_id": str(application.get("_id")),
            "application_id": application.get("applicationId", "N/A"),
            "name": application.get("applicantName", "N/A"),
            "email": application.get("email", "N/A"),
            "phone": application.get("phone", "N/A"),
            "service_type": application.get("serviceType", "N/A"),
            "status": application.get("status", "pending").title(),
            "created_at": application.get("createdAt").isoformat() if application.get("createdAt") else None,
            "updated_at": application.get("updatedAt").isoformat() if application.get("updatedAt") else None,
            "documents": application.get("documents", {}),
            "application_data": application.get("applicationData", {})
        }
        
        return JSONResponse(content=result, status_code=200)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching application: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_data: dict
):
    """Update status of a retail service application"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceApplications"]
        
        new_status = status_data.get("status", "").lower()
        if new_status not in ["pending", "approved", "completed", "rejected"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        # Try to update by MongoDB _id first
        try:
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {
                    "$set": {
                        "status": new_status,
                        "updatedAt": datetime.now()
                    }
                }
            )
        except:
            # If ObjectId fails, try to update by applicationId field
            result = collection.update_one(
                {"applicationId": application_id},
                {
                    "$set": {
                        "status": new_status,
                        "updatedAt": datetime.now()
                    }
                }
            )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Application not found or status unchanged")
        
        return JSONResponse(
            content={
                "success": True,
                "message": "Application status updated successfully",
                "status": new_status.title()
            },
            status_code=200
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/statistics")
async def get_retail_services_statistics():
    """Get statistics for retail services dashboard"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceApplications"]
        
        # Get all applications
        total = collection.count_documents({})
        
        # Count all possible statuses (case-insensitive)
        pending = collection.count_documents({"status": {"$regex": "^pending$", "$options": "i"}})
        in_progress = collection.count_documents({"status": {"$regex": "^in-progress$", "$options": "i"}})
        approved = collection.count_documents({"status": {"$regex": "^approved$", "$options": "i"}})
        completed = collection.count_documents({"status": {"$regex": "^completed$", "$options": "i"}})
        rejected = collection.count_documents({"status": {"$regex": "^rejected$", "$options": "i"}})
        
        return JSONResponse(
            content={
                "total": total,
                "pending": pending,
                "inProgress": in_progress,
                "approved": approved,
                "completed": completed,
                "rejected": rejected
            },
            status_code=200
        )
        
    except Exception as e:
        print(f"Error fetching statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/applications/{application_id}/documents/{document_key}")
async def download_application_document(application_id: str, document_key: str):
    """Download a specific document from an application"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceApplications"]
        
        # Try to find by MongoDB _id first
        try:
            application = collection.find_one({"_id": ObjectId(application_id)})
        except:
            # If ObjectId fails, try to find by applicationId field
            application = collection.find_one({"applicationId": application_id})
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get document path
        documents = application.get("documents", {})
        if document_key not in documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        file_path = documents[document_key]
        
        # Debug: Print file path
        print(f"📄 Attempting to download: {file_path}")
        print(f"📁 File exists: {os.path.exists(file_path)}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ File not found at path: {file_path}")
            raise HTTPException(status_code=404, detail=f"Document file not found on server: {file_path}")
        
        # Get file size for debugging
        file_size = os.path.getsize(file_path)
        print(f"📊 File size: {file_size} bytes")
        
        # Determine media type based on file extension
        import mimetypes
        media_type, _ = mimetypes.guess_type(file_path)
        if not media_type:
            media_type = "application/octet-stream"
        
        print(f"📎 Media type: {media_type}")
        print(f"✅ Serving file: {os.path.basename(file_path)}")
        
        # Return the file
        from fastapi.responses import FileResponse
        return FileResponse(
            path=file_path,
            filename=os.path.basename(file_path),
            media_type=media_type
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error downloading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
