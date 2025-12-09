import os
import json
import requests
import shutil
from PIL import Image 
from django.core.management.base import BaseCommand
from api.models import Feedback 

class Command(BaseCommand):
    help = 'Exports data for LLaVA (Handles missing images via dummy fallback)'

    def handle(self, *args, **options):
        base_dir = "training_export"
        images_dir = os.path.join(base_dir, "images")
        
        #setup directories and dummy placeholder
        if os.path.exists(base_dir): shutil.rmtree(base_dir)
        os.makedirs(images_dir)

        #create a reusable black dummy image for text-only cases to satisfy llava-med architecture
        dummy_path = os.path.join(images_dir, "text_only_placeholder.jpg")
        Image.new('RGB', (224, 224), color='black').save(dummy_path)

        #filter for cases that need correction
        feedbacks = Feedback.objects.filter(accuracy_correctness__in=['incorrect', 'partial'])
        
        print(f"\nFound {feedbacks.count()} training candidates.")

        dataset = []
        count_success = 0

        for item in feedbacks:
            case = item.diagnosis.diagnostic_case
            
            img_input = None
            inputs = case.inputs.all()
            for inp in inputs:
                if inp.file_url and any(x in str(inp.file_name).lower() for x in ['jpg', 'png', 'jpeg']):
                    img_input = inp
                    break
            
            final_image_filename = "text_only_placeholder.jpg" #default to dummy
            
            # if real image exists, download it
            if img_input:
                ext = img_input.file_name.split('.')[-1] if img_input.file_name else 'jpg'
                real_filename = f"{case.id}.{ext}"
                local_path = os.path.join(images_dir, real_filename)
                
                try:
                    response = requests.get(img_input.file_url, timeout=5)
                    if response.status_code == 200:
                        with open(local_path, 'wb') as f:
                            f.write(response.content)
                        final_image_filename = real_filename
                    else:
                        print(f"    Failed to download image for Case {case.id}. Using black placeholder.")
                except:
                    print(f"    Error downloading image for Case {case.id}. Using black placeholder.")
            else:
                print(f"    Case {case.id} is Text-Only. Using black placeholder.")

            
            user_text = "Analyze the following medical case and provide a diagnosis."
            
            # Add patient profile/description to the prompt
            context_parts = []
            if case.description:
                context_parts.append(f"Case Description: {case.description}")
            if case.profile_info:
                context_parts.append(f"Patient Profile: {json.dumps(case.profile_info)}")
            
            if context_parts:
                user_text = "\n".join(context_parts) + "\n" + user_text

            #construct ground truth answer
            ground_truth = item.actual_diagnosis or "Unknown"
            if item.general_comments:
                ground_truth += f". Note: {item.general_comments}"

            #format for llava json
            entry = {
                "id": str(case.id),
                "image": final_image_filename, # Points to real image OR black square
                "conversations": [
                    {
                        "from": "human",
                        "value": f"<image>\n{user_text}"
                    },
                    {
                        "from": "gpt",
                        "value": ground_truth
                    }
                ]
            }
            dataset.append(entry)
            count_success += 1

        #save and zip
        json_path = os.path.join(base_dir, "dataset.json")
        with open(json_path, 'w') as f:
            json.dump(dataset, f, indent=2)

        shutil.make_archive("llava_training_data", 'zip', base_dir)
        
        print("\n========================================")
        print(f" Exported {count_success} training samples.")
        print("========================================")